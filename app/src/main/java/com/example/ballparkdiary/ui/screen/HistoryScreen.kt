package com.example.ballparkdiary.ui.screen

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.SwipeToDismissBox
import androidx.compose.material3.SwipeToDismissBoxValue
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberSwipeToDismissBoxState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ballparkdiary.data.entity.GameRecord
import com.example.ballparkdiary.ui.viewmodel.GameViewModel

private val filterOptions = listOf(
    null to "すべて",
    "WIN" to "勝ち",
    "LOSE" to "負け",
    "DRAW" to "引分",
    "CANCELLED" to "中止"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(
    viewModel: GameViewModel,
    onEditRecord: (Long) -> Unit = {}
) {
    val records by viewModel.filteredRecords.collectAsStateWithLifecycle()
    val allRecords by viewModel.allRecords.collectAsStateWithLifecycle()
    val currentFilter by viewModel.resultFilter.collectAsStateWithLifecycle()

    var recordToDelete by remember { mutableStateOf<GameRecord?>(null) }

    // 削除確認ダイアログ
    recordToDelete?.let { record ->
        AlertDialog(
            onDismissRequest = { recordToDelete = null },
            title = { Text("削除の確認") },
            text = { Text("${record.date} ${record.stadium} の記録を削除しますか？") },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.deleteRecord(record)
                    recordToDelete = null
                }) {
                    Text("削除", color = Color(0xFFF44336))
                }
            },
            dismissButton = {
                TextButton(onClick = { recordToDelete = null }) {
                    Text("キャンセル")
                }
            }
        )
    }

    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(title = { Text("現地観戦記録") })

        // ミニ戦績サマリー
        if (allRecords.isNotEmpty()) {
            val wins = allRecords.count { it.result == "WIN" }
            val loses = allRecords.count { it.result == "LOSE" }
            val draws = allRecords.count { it.result == "DRAW" }
            val total = allRecords.count { it.result != "CANCELLED" }
            val rate = if (total > 0) wins.toFloat() / total * 100 else 0f
            val spending = allRecords.mapNotNull { it.ticketPrice }.sum()

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "%.1f%%".format(rate),
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            text = "${wins}勝 ${loses}敗 ${draws}分",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Text(
                            text = "全${allRecords.size}試合",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                        )
                    }
                    if (spending > 0) {
                        Text(
                            text = "累計チケット代: %,d円".format(spending),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f),
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
        }

        // フィルターチップ
        LazyRow(
            modifier = Modifier.padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(filterOptions) { (value, label) ->
                FilterChip(
                    selected = currentFilter == value,
                    onClick = { viewModel.setResultFilter(value) },
                    label = { Text(label) }
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        if (records.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (currentFilter != null) "該当する記録がありません"
                    else "まだ記録がありません\n「試合登録」から追加してください",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(records, key = { it.id }) { record ->
                    val dismissState = rememberSwipeToDismissBoxState(
                        confirmValueChange = { value ->
                            if (value == SwipeToDismissBoxValue.EndToStart) {
                                recordToDelete = record
                                false
                            } else false
                        }
                    )

                    SwipeToDismissBox(
                        state = dismissState,
                        backgroundContent = {
                            val color by animateColorAsState(
                                when (dismissState.targetValue) {
                                    SwipeToDismissBoxValue.EndToStart -> Color(0xFFF44336)
                                    else -> Color.Transparent
                                },
                                label = "bg"
                            )
                            val scale by animateFloatAsState(
                                if (dismissState.targetValue == SwipeToDismissBoxValue.Settled) 0.75f else 1f,
                                label = "scale"
                            )
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(color, RoundedCornerShape(12.dp))
                                    .padding(end = 20.dp),
                                contentAlignment = Alignment.CenterEnd
                            ) {
                                Icon(
                                    Icons.Default.Delete,
                                    contentDescription = "削除",
                                    modifier = Modifier.scale(scale),
                                    tint = Color.White
                                )
                            }
                        },
                        enableDismissFromStartToEnd = false
                    ) {
                        GameRecordItem(
                            record = record,
                            onClick = { onEditRecord(record.id) }
                        )
                    }
                }

                item { Spacer(modifier = Modifier.height(8.dp)) }
            }
        }
    }
}

@Composable
private fun GameRecordItem(
    record: GameRecord,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            ResultBadge(result = record.result)

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                // 日付 + 天気
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = record.date,
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    record.weather?.let { w ->
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = weatherEmoji(w),
                            style = MaterialTheme.typography.labelMedium
                        )
                    }
                }
                Text(
                    text = "${record.stadium} vs ${record.opponent}",
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium
                )
                // 座席・チケット代・同行者のサブ情報行
                val subInfoParts = mutableListOf<String>()
                record.seatInfo?.let { subInfoParts.add(it) }
                record.ticketPrice?.let { subInfoParts.add("%,d円".format(it)) }
                record.companions?.let { subInfoParts.add(it) }
                if (subInfoParts.isNotEmpty()) {
                    Text(
                        text = subInfoParts.joinToString(" / "),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary,
                        maxLines = 1
                    )
                }
                if (record.memo.isNotBlank()) {
                    Text(
                        text = record.memo,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1
                    )
                }
            }

            // スコア表示
            if (record.myScore != null && record.opponentScore != null) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "${record.myScore} - ${record.opponentScore}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
private fun ResultBadge(result: String) {
    val (text, color) = when (result) {
        "WIN" -> "勝" to Color(0xFF4CAF50)
        "LOSE" -> "負" to Color(0xFFF44336)
        "DRAW" -> "分" to Color(0xFFFF9800)
        "CANCELLED" -> "中" to Color(0xFF9E9E9E)
        else -> "?" to Color.Gray
    }

    Surface(
        modifier = Modifier.size(44.dp),
        shape = RoundedCornerShape(10.dp),
        color = color
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(
                text = text,
                color = Color.White,
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.titleMedium
            )
        }
    }
}
