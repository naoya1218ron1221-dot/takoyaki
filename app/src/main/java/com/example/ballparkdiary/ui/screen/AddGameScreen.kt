package com.example.ballparkdiary.ui.screen

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.ballparkdiary.data.entity.GameRecord
import com.example.ballparkdiary.ui.viewmodel.GameViewModel
import java.time.LocalDate
import java.time.format.DateTimeFormatter

private val stadiums = listOf(
    "東京ドーム", "明治神宮球場", "横浜スタジアム", "バンテリンドーム ナゴヤ",
    "甲子園球場", "マツダスタジアム", "PayPayドーム", "京セラドーム大阪",
    "楽天モバイルパーク宮城", "ベルーナドーム", "ZOZOマリンスタジアム",
    "エスコンフィールドHOKKAIDO"
)

private val teams = listOf(
    "巨人", "阪神", "中日", "DeNA", "広島", "ヤクルト",
    "オリックス", "ソフトバンク", "西武", "楽天", "ロッテ", "日本ハム"
)

private val resultOptions = listOf(
    "WIN" to "勝ち",
    "LOSE" to "負け",
    "DRAW" to "引き分け",
    "CANCELLED" to "中止"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddGameScreen(
    viewModel: GameViewModel,
    onSaved: () -> Unit
) {
    val today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)

    var date by remember { mutableStateOf(today) }
    var stadium by remember { mutableStateOf("") }
    var stadiumExpanded by remember { mutableStateOf(false) }
    var opponent by remember { mutableStateOf("") }
    var opponentExpanded by remember { mutableStateOf(false) }
    var selectedResult by remember { mutableStateOf("WIN") }
    var memo by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
    ) {
        TopAppBar(title = { Text("試合登録") })

        Column(
            modifier = Modifier
                .padding(horizontal = 16.dp)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // 日付
            OutlinedTextField(
                value = date,
                onValueChange = { date = it },
                label = { Text("日付 (yyyy-MM-dd)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            // 球場
            ExposedDropdownMenuBox(
                expanded = stadiumExpanded,
                onExpandedChange = { stadiumExpanded = !stadiumExpanded }
            ) {
                OutlinedTextField(
                    value = stadium,
                    onValueChange = { stadium = it },
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

            // 勝敗
            Text("勝敗")
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                resultOptions.forEach { (value, label) ->
                    FilterChip(
                        selected = selectedResult == value,
                        onClick = { selectedResult = value },
                        label = { Text(label) }
                    )
                }
            }

            // メモ
            OutlinedTextField(
                value = memo,
                onValueChange = { memo = it },
                label = { Text("メモ") },
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
                        viewModel.insertRecord(
                            GameRecord(
                                date = date,
                                stadium = stadium,
                                opponent = opponent,
                                result = selectedResult,
                                memo = memo
                            )
                        )
                        onSaved()
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = date.isNotBlank() && stadium.isNotBlank() && opponent.isNotBlank()
            ) {
                Text("保存する")
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
