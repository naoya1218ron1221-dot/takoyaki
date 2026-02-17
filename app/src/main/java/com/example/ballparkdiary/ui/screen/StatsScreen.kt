package com.example.ballparkdiary.ui.screen

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ballparkdiary.data.dao.MonthlySpending
import com.example.ballparkdiary.data.dao.StadiumSpending
import com.example.ballparkdiary.data.dao.WeatherStat
import com.example.ballparkdiary.ui.viewmodel.CompanionStat
import com.example.ballparkdiary.ui.viewmodel.GameViewModel
import com.example.ballparkdiary.ui.viewmodel.StreakInfo

private val tabs = listOf("総合", "球場別", "対戦相手別", "月別", "天気別", "支出", "同行者別")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StatsScreen(viewModel: GameViewModel) {
    val totalGames by viewModel.totalGames.collectAsStateWithLifecycle()
    val winCount by viewModel.winCount.collectAsStateWithLifecycle()
    val loseCount by viewModel.loseCount.collectAsStateWithLifecycle()
    val drawCount by viewModel.drawCount.collectAsStateWithLifecycle()
    val stadiumStats by viewModel.stadiumStats.collectAsStateWithLifecycle()
    val opponentStats by viewModel.opponentStats.collectAsStateWithLifecycle()
    val monthlyStats by viewModel.monthlyStats.collectAsStateWithLifecycle()
    val weatherStats by viewModel.weatherStats.collectAsStateWithLifecycle()
    val stadiumSpending by viewModel.stadiumSpending.collectAsStateWithLifecycle()
    val monthlySpending by viewModel.monthlySpending.collectAsStateWithLifecycle()
    val totalSpending by viewModel.totalSpending.collectAsStateWithLifecycle()
    val companionStats by viewModel.companionStats.collectAsStateWithLifecycle()
    val streakInfo by viewModel.streakInfo.collectAsStateWithLifecycle()

    var selectedTab by remember { mutableIntStateOf(0) }

    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(title = { Text("データ分析") })

        ScrollableTabRow(selectedTabIndex = selectedTab) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { Text(title) }
                )
            }
        }

        when (selectedTab) {
            0 -> OverallTab(totalGames, winCount, loseCount, drawCount, streakInfo, totalSpending)
            1 -> StadiumTab(stadiumStats)
            2 -> OpponentTab(opponentStats)
            3 -> MonthlyTab(monthlyStats)
            4 -> WeatherTab(weatherStats)
            5 -> SpendingTab(totalSpending, stadiumSpending, monthlySpending)
            6 -> CompanionTab(companionStats)
        }
    }
}

// ========== 総合タブ ==========

@Composable
private fun OverallTab(
    totalGames: Int,
    winCount: Int,
    loseCount: Int,
    drawCount: Int,
    streakInfo: StreakInfo,
    totalSpending: Int
) {
    val winRate = if (totalGames > 0) winCount.toFloat() / totalGames * 100 else 0f

    LazyColumn(
        modifier = Modifier
            .padding(horizontal = 16.dp)
            .fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item { Spacer(modifier = Modifier.height(4.dp)) }

        // 勝率カード
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("現地勝率", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "%.1f%%".format(winRate),
                        style = MaterialTheme.typography.displayMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    if (totalGames > 0) {
                        LinearProgressIndicator(
                            progress = { winRate / 100f },
                            modifier = Modifier.fillMaxWidth().height(10.dp),
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        StatItem("試合", "$totalGames", MaterialTheme.colorScheme.onSurface)
                        StatItem("勝ち", "$winCount", Color(0xFF4CAF50))
                        StatItem("負け", "$loseCount", Color(0xFFF44336))
                        StatItem("引分", "$drawCount", Color(0xFFFF9800))
                    }
                }
            }
        }

        // 連勝・連敗カード
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("ストリーク", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(12.dp))

                    if (streakInfo.currentType.isNotEmpty()) {
                        val (label, color) = when (streakInfo.currentType) {
                            "WIN" -> "連勝中" to Color(0xFF4CAF50)
                            else -> "連敗中" to Color(0xFFF44336)
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("現在: ", style = MaterialTheme.typography.bodyLarge)
                            Text(
                                text = "${streakInfo.currentCount}${label}",
                                style = MaterialTheme.typography.headlineSmall,
                                fontWeight = FontWeight.Bold,
                                color = color
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                "${streakInfo.maxWinStreak}",
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF4CAF50)
                            )
                            Text("最大連勝", style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                "${streakInfo.maxLoseStreak}",
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFF44336)
                            )
                            Text("最大連敗", style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }

        // 累計支出カード
        if (totalSpending > 0) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("累計チケット代", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "%,d円".format(totalSpending),
                            style = MaterialTheme.typography.displaySmall,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF2196F3)
                        )
                        if (totalGames > 0) {
                            Text(
                                text = "1試合あたり平均 %,d円".format(totalSpending / totalGames),
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }

        item { Spacer(modifier = Modifier.height(8.dp)) }
    }
}

// ========== 球場別タブ ==========

@Composable
private fun StadiumTab(
    stats: List<com.example.ballparkdiary.data.dao.StadiumStat>
) {
    if (stats.isEmpty()) {
        EmptyMessage()
        return
    }

    LazyColumn(
        modifier = Modifier
            .padding(horizontal = 16.dp)
            .fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item { Spacer(modifier = Modifier.height(4.dp)) }
        items(stats) { stat ->
            val rate = if (stat.total > 0) stat.wins.toFloat() / stat.total * 100 else 0f
            StatCard(
                title = stat.stadium,
                rate = rate,
                detail = "${stat.wins}勝 ${stat.loses}敗 / ${stat.total}試合"
            )
        }
        item { Spacer(modifier = Modifier.height(8.dp)) }
    }
}

// ========== 対戦相手別タブ ==========

@Composable
private fun OpponentTab(
    stats: List<com.example.ballparkdiary.data.dao.OpponentStat>
) {
    if (stats.isEmpty()) {
        EmptyMessage()
        return
    }

    LazyColumn(
        modifier = Modifier
            .padding(horizontal = 16.dp)
            .fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item { Spacer(modifier = Modifier.height(4.dp)) }
        items(stats) { stat ->
            val rate = if (stat.total > 0) stat.wins.toFloat() / stat.total * 100 else 0f
            StatCard(
                title = stat.opponent,
                rate = rate,
                detail = "${stat.wins}勝 ${stat.loses}敗 / ${stat.total}試合"
            )
        }
        item { Spacer(modifier = Modifier.height(8.dp)) }
    }
}

// ========== 月別タブ ==========

@Composable
private fun MonthlyTab(
    stats: List<com.example.ballparkdiary.data.dao.MonthlyStat>
) {
    if (stats.isEmpty()) {
        EmptyMessage()
        return
    }

    LazyColumn(
        modifier = Modifier
            .padding(horizontal = 16.dp)
            .fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item { Spacer(modifier = Modifier.height(4.dp)) }
        items(stats) { stat ->
            val rate = if (stat.total > 0) stat.wins.toFloat() / stat.total * 100 else 0f
            StatCard(
                title = stat.month,
                rate = rate,
                detail = "${stat.wins}勝 ${stat.loses}敗 / ${stat.total}試合"
            )
        }
        item { Spacer(modifier = Modifier.height(8.dp)) }
    }
}

// ========== 天気別タブ ==========

@Composable
private fun WeatherTab(stats: List<WeatherStat>) {
    if (stats.isEmpty()) {
        EmptyMessage()
        return
    }

    LazyColumn(
        modifier = Modifier
            .padding(horizontal = 16.dp)
            .fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item { Spacer(modifier = Modifier.height(4.dp)) }
        items(stats) { stat ->
            val rate = if (stat.total > 0) stat.wins.toFloat() / stat.total * 100 else 0f
            StatCard(
                title = "${weatherEmoji(stat.weather)} ${stat.weather}",
                rate = rate,
                detail = "${stat.wins}勝 ${stat.loses}敗 / ${stat.total}試合"
            )
        }
        item { Spacer(modifier = Modifier.height(8.dp)) }
    }
}

// ========== 支出タブ ==========

@Composable
private fun SpendingTab(
    totalSpending: Int,
    stadiumSpending: List<StadiumSpending>,
    monthlySpending: List<MonthlySpending>
) {
    LazyColumn(
        modifier = Modifier
            .padding(horizontal = 16.dp)
            .fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item { Spacer(modifier = Modifier.height(4.dp)) }

        // 合計支出サマリー
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("チケット代 合計", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "%,d円".format(totalSpending),
                        style = MaterialTheme.typography.displaySmall,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF2196F3)
                    )
                }
            }
        }

        // 球場別支出
        if (stadiumSpending.isNotEmpty()) {
            item {
                Text("球場別", style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
            }
            items(stadiumSpending) { stat ->
                SpendingCard(
                    title = stat.stadium,
                    total = stat.totalSpending,
                    count = stat.visitCount,
                    avg = stat.avgPrice,
                    maxTotal = stadiumSpending.maxOf { it.totalSpending }
                )
            }
        }

        // 月別支出
        if (monthlySpending.isNotEmpty()) {
            item {
                Spacer(modifier = Modifier.height(4.dp))
                Text("月別", style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
            }
            items(monthlySpending) { stat ->
                SpendingCard(
                    title = stat.month,
                    total = stat.totalSpending,
                    count = stat.visitCount,
                    avg = stat.avgPrice,
                    maxTotal = monthlySpending.maxOf { it.totalSpending }
                )
            }
        }

        if (stadiumSpending.isEmpty() && monthlySpending.isEmpty() && totalSpending == 0) {
            item { EmptyMessage() }
        }

        item { Spacer(modifier = Modifier.height(8.dp)) }
    }
}

// ========== 同行者別タブ ==========

@Composable
private fun CompanionTab(stats: List<CompanionStat>) {
    if (stats.isEmpty()) {
        EmptyMessage()
        return
    }

    LazyColumn(
        modifier = Modifier
            .padding(horizontal = 16.dp)
            .fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item { Spacer(modifier = Modifier.height(4.dp)) }
        items(stats) { stat ->
            val rate = if (stat.total > 0) stat.wins.toFloat() / stat.total * 100 else 0f
            StatCard(
                title = stat.name,
                rate = rate,
                detail = "${stat.wins}勝 ${stat.loses}敗 / ${stat.total}試合"
            )
        }
        item { Spacer(modifier = Modifier.height(8.dp)) }
    }
}

// ========== 共通コンポーネント ==========

@Composable
private fun StatCard(title: String, rate: Float, detail: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "%.1f%%".format(rate),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            Text(
                text = detail,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(6.dp))
            LinearProgressIndicator(
                progress = { if (rate > 0) rate / 100f else 0f },
                modifier = Modifier.fillMaxWidth().height(6.dp),
            )
        }
    }
}

@Composable
private fun SpendingCard(title: String, total: Int, count: Int, avg: Int, maxTotal: Int) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "%,d円".format(total),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF2196F3)
                )
            }
            Text(
                text = "${count}回 / 平均 %,d円".format(avg),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(6.dp))
            if (maxTotal > 0) {
                LinearProgressIndicator(
                    progress = { total.toFloat() / maxTotal },
                    modifier = Modifier.fillMaxWidth().height(6.dp),
                    color = Color(0xFF2196F3)
                )
            }
        }
    }
}

@Composable
private fun StatItem(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun EmptyMessage() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "データがありません",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
