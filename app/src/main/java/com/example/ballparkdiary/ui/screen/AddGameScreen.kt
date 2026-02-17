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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material3.Button
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.example.ballparkdiary.data.entity.GameRecord
import com.example.ballparkdiary.ui.viewmodel.GameViewModel
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter

val stadiums = listOf(
    "東京ドーム", "明治神宮球場", "横浜スタジアム", "バンテリンドーム ナゴヤ",
    "甲子園球場", "マツダスタジアム", "PayPayドーム", "京セラドーム大阪",
    "楽天モバイルパーク宮城", "ベルーナドーム", "ZOZOマリンスタジアム",
    "エスコンフィールドHOKKAIDO"
)

val teams = listOf(
    "巨人", "阪神", "中日", "DeNA", "広島", "ヤクルト",
    "オリックス", "ソフトバンク", "西武", "楽天", "ロッテ", "日本ハム"
)

private val resultOptions = listOf(
    "WIN" to "勝ち",
    "LOSE" to "負け",
    "DRAW" to "引き分け",
    "CANCELLED" to "中止"
)

private val resultColors = mapOf(
    "WIN" to Color(0xFF4CAF50),
    "LOSE" to Color(0xFFF44336),
    "DRAW" to Color(0xFFFF9800),
    "CANCELLED" to Color(0xFF9E9E9E)
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddGameScreen(
    viewModel: GameViewModel,
    editRecord: GameRecord? = null,
    onSaved: () -> Unit
) {
    val isEditMode = editRecord != null
    val today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)

    var date by remember { mutableStateOf(editRecord?.date ?: today) }
    var stadium by remember { mutableStateOf(editRecord?.stadium ?: "") }
    var stadiumExpanded by remember { mutableStateOf(false) }
    var opponent by remember { mutableStateOf(editRecord?.opponent ?: "") }
    var opponentExpanded by remember { mutableStateOf(false) }
    var selectedResult by remember { mutableStateOf(editRecord?.result ?: "WIN") }
    var myScoreText by remember { mutableStateOf(editRecord?.myScore?.toString() ?: "") }
    var opponentScoreText by remember { mutableStateOf(editRecord?.opponentScore?.toString() ?: "") }
    var memo by remember { mutableStateOf(editRecord?.memo ?: "") }
    var showDatePicker by remember { mutableStateOf(false) }

    // DatePicker のミリ秒をyyyy-MM-ddに変換
    if (showDatePicker) {
        val datePickerState = rememberDatePickerState(
            initialSelectedDateMillis = try {
                LocalDate.parse(date).atStartOfDay(ZoneId.of("UTC"))
                    .toInstant().toEpochMilli()
            } catch (_: Exception) {
                System.currentTimeMillis()
            }
        )
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    datePickerState.selectedDateMillis?.let { millis ->
                        date = Instant.ofEpochMilli(millis)
                            .atZone(ZoneId.of("UTC"))
                            .toLocalDate()
                            .format(DateTimeFormatter.ISO_LOCAL_DATE)
                    }
                    showDatePicker = false
                }) { Text("OK") }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) { Text("キャンセル") }
            }
        ) {
            DatePicker(state = datePickerState)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
    ) {
        TopAppBar(title = { Text(if (isEditMode) "試合を編集" else "試合登録") })

        Column(
            modifier = Modifier
                .padding(horizontal = 16.dp)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // 日付（DatePickerボタン付き）
            OutlinedTextField(
                value = date,
                onValueChange = { date = it },
                label = { Text("日付") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                readOnly = true,
                trailingIcon = {
                    IconButton(onClick = { showDatePicker = true }) {
                        Icon(Icons.Default.DateRange, contentDescription = "日付を選択")
                    }
                }
            )

            // 球場
            ExposedDropdownMenuBox(
                expanded = stadiumExpanded,
                onExpandedChange = { stadiumExpanded = !stadiumExpanded }
            ) {
                OutlinedTextField(
                    value = stadium,
                    onValueChange = {
                        stadium = it
                        stadiumExpanded = true
                    },
                    label = { Text("球場") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = stadiumExpanded) },
                    singleLine = true
                )
                val filtered = stadiums.filter { it.contains(stadium, ignoreCase = true) }
                if (filtered.isNotEmpty()) {
                    ExposedDropdownMenu(
                        expanded = stadiumExpanded,
                        onDismissRequest = { stadiumExpanded = false }
                    ) {
                        filtered.forEach { item ->
                            DropdownMenuItem(
                                text = { Text(item) },
                                onClick = {
                                    stadium = item
                                    stadiumExpanded = false
                                }
                            )
                        }
                    }
                }
            }

            // 対戦相手
            ExposedDropdownMenuBox(
                expanded = opponentExpanded,
                onExpandedChange = { opponentExpanded = !opponentExpanded }
            ) {
                OutlinedTextField(
                    value = opponent,
                    onValueChange = { opponent = it },
                    label = { Text("対戦相手") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = opponentExpanded) },
                    singleLine = true,
                    readOnly = true
                )
                ExposedDropdownMenu(
                    expanded = opponentExpanded,
                    onDismissRequest = { opponentExpanded = false }
                ) {
                    teams.forEach { team ->
                        DropdownMenuItem(
                            text = { Text(team) },
                            onClick = {
                                opponent = team
                                opponentExpanded = false
                            }
                        )
                    }
                }
            }

            // 勝敗（色付きチップ）
            Text("勝敗", style = MaterialTheme.typography.labelLarge)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                resultOptions.forEach { (value, label) ->
                    val chipColor = resultColors[value] ?: Color.Gray
                    FilterChip(
                        selected = selectedResult == value,
                        onClick = { selectedResult = value },
                        label = { Text(label) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = chipColor.copy(alpha = 0.2f),
                            selectedLabelColor = chipColor
                        )
                    )
                }
            }

            // スコア入力
            Text("スコア（任意）", style = MaterialTheme.typography.labelLarge)
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                OutlinedTextField(
                    value = myScoreText,
                    onValueChange = { if (it.all { c -> c.isDigit() } && it.length <= 2) myScoreText = it },
                    label = { Text("自チーム") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                Text(
                    " - ",
                    style = MaterialTheme.typography.headlineMedium,
                    modifier = Modifier.padding(top = 12.dp)
                )
                OutlinedTextField(
                    value = opponentScoreText,
                    onValueChange = { if (it.all { c -> c.isDigit() } && it.length <= 2) opponentScoreText = it },
                    label = { Text("相手") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
            }

            // メモ
            OutlinedTextField(
                value = memo,
                onValueChange = { memo = it },
                label = { Text("メモ") },
                placeholder = { Text("印象に残ったプレーなど...") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp),
                maxLines = 5
            )

            Spacer(modifier = Modifier.height(8.dp))

            // 保存ボタン
            Button(
                onClick = {
                    if (date.isNotBlank() && stadium.isNotBlank() && opponent.isNotBlank()) {
                        val myScore = myScoreText.toIntOrNull()
                        val oppScore = opponentScoreText.toIntOrNull()
                        val record = GameRecord(
                            id = editRecord?.id ?: 0,
                            date = date,
                            stadium = stadium,
                            opponent = opponent,
                            result = selectedResult,
                            myScore = myScore,
                            opponentScore = oppScore,
                            memo = memo,
                            createdAt = editRecord?.createdAt ?: System.currentTimeMillis()
                        )
                        if (isEditMode) {
                            viewModel.updateRecord(record)
                        } else {
                            viewModel.insertRecord(record)
                        }
                        onSaved()
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = date.isNotBlank() && stadium.isNotBlank() && opponent.isNotBlank()
            ) {
                Text(if (isEditMode) "更新する" else "保存する")
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
