package com.example.ballparkdiary.ui.screen

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ballparkdiary.ui.viewmodel.GameViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StatsScreen(viewModel: GameViewModel) {
    val totalGames by viewModel.totalGames.collectAsStateWithLifecycle()
    val winCount by viewModel.winCount.collectAsStateWithLifecycle()
    val loseCount by viewModel.loseCount.collectAsStateWithLifecycle()
    val drawCount by viewModel.drawCount.collectAsStateWithLifecycle()
    val stadiumStats by viewModel.stadiumStats.collectAsStateWithLifecycle()

    val winRate = if (totalGames > 0) winCount.toFloat() / totalGames * 100 else 0f

    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(title = { Text("データ分析") })

        LazyColumn(
            modifier = Modifier
                .padding(horizontal = 16.dp)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // トータル戦績
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "トータル戦績",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        // 勝率の大きな表示
                        Text(
                            text = "現地勝率",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "%.1f%%".format(winRate),
                            style = MaterialTheme.typography.displaySmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        if (totalGames > 0) {
                            LinearProgressIndicator(
                                progress = { winRate / 100f },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(8.dp),
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // 勝敗の内訳
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            StatItem(label = "試合", value = "$totalGames")
                            StatItem(label = "勝ち", value = "$winCount")
                            StatItem(label = "負け", value = "$loseCount")
                            StatItem(label = "引分", value = "$drawCount")
                        }
                    }
                }
            }

            // 球場別勝率
            item {
                Text(
                    text = "球場別勝率",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }

            if (stadiumStats.isEmpty()) {
                item {
                    Text(
                        text = "データがありません",
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            items(stadiumStats) { stat ->
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
                                text = stat.stadium,
                                style = MaterialTheme.typography.bodyLarge,
                                fontWeight = FontWeight.Medium
                            )
                            val rate = if (stat.total > 0) stat.wins.toFloat() / stat.total * 100 else 0f
                            Text(
                                text = "%.1f%% (%d勝 / %d試合)".format(rate, stat.wins, stat.total),
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        if (stat.total > 0) {
                            LinearProgressIndicator(
                                progress = { stat.wins.toFloat() / stat.total },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(6.dp),
                            )
                        }
                    }
                }
            }

            item { Spacer(modifier = Modifier.height(8.dp)) }
        }
    }
}

@Composable
private fun StatItem(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
