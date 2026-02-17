package com.example.ballparkdiary.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.ballparkdiary.data.dao.MonthlyStat
import com.example.ballparkdiary.data.dao.MonthlySpending
import com.example.ballparkdiary.data.dao.OpponentStat
import com.example.ballparkdiary.data.dao.StadiumSpending
import com.example.ballparkdiary.data.dao.StadiumStat
import com.example.ballparkdiary.data.dao.WeatherStat
import com.example.ballparkdiary.data.database.AppDatabase
import com.example.ballparkdiary.data.entity.GameRecord
import com.example.ballparkdiary.data.repository.GameRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class StreakInfo(
    val currentType: String,   // "WIN" or "LOSE" or ""
    val currentCount: Int,
    val maxWinStreak: Int,
    val maxLoseStreak: Int
)

data class CompanionStat(
    val name: String,
    val wins: Int,
    val loses: Int,
    val total: Int
)

class GameViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: GameRepository

    // フィルター状態
    private val _resultFilter = MutableStateFlow<String?>(null) // null = 全て
    val resultFilter: StateFlow<String?> = _resultFilter.asStateFlow()

    // 編集対象
    private val _editTarget = MutableStateFlow<GameRecord?>(null)
    val editTarget: StateFlow<GameRecord?> = _editTarget.asStateFlow()

    // データ
    val allRecords: StateFlow<List<GameRecord>>
    val filteredRecords: StateFlow<List<GameRecord>>
    val totalGames: StateFlow<Int>
    val winCount: StateFlow<Int>
    val loseCount: StateFlow<Int>
    val drawCount: StateFlow<Int>
    val stadiumStats: StateFlow<List<StadiumStat>>
    val opponentStats: StateFlow<List<OpponentStat>>
    val monthlyStats: StateFlow<List<MonthlyStat>>
    val weatherStats: StateFlow<List<WeatherStat>>
    val stadiumSpending: StateFlow<List<StadiumSpending>>
    val monthlySpending: StateFlow<List<MonthlySpending>>
    val totalSpending: StateFlow<Int>
    val streakInfo: StateFlow<StreakInfo>
    val companionStats: StateFlow<List<CompanionStat>>

    init {
        val dao = AppDatabase.getDatabase(application).gameDao()
        repository = GameRepository(dao)

        val whileSubscribed = SharingStarted.WhileSubscribed(5000)

        allRecords = repository.allRecords
            .stateIn(viewModelScope, whileSubscribed, emptyList())

        filteredRecords = combine(repository.allRecords, _resultFilter) { records, filter ->
            if (filter == null) records
            else records.filter { it.result == filter }
        }.stateIn(viewModelScope, whileSubscribed, emptyList())

        totalGames = repository.totalGames
            .stateIn(viewModelScope, whileSubscribed, 0)
        winCount = repository.winCount
            .stateIn(viewModelScope, whileSubscribed, 0)
        loseCount = repository.loseCount
            .stateIn(viewModelScope, whileSubscribed, 0)
        drawCount = repository.drawCount
            .stateIn(viewModelScope, whileSubscribed, 0)
        stadiumStats = repository.stadiumStats
            .stateIn(viewModelScope, whileSubscribed, emptyList())
        opponentStats = repository.opponentStats
            .stateIn(viewModelScope, whileSubscribed, emptyList())
        monthlyStats = repository.monthlyStats
            .stateIn(viewModelScope, whileSubscribed, emptyList())
        weatherStats = repository.weatherStats
            .stateIn(viewModelScope, whileSubscribed, emptyList())
        stadiumSpending = repository.stadiumSpending
            .stateIn(viewModelScope, whileSubscribed, emptyList())
        monthlySpending = repository.monthlySpending
            .stateIn(viewModelScope, whileSubscribed, emptyList())
        totalSpending = repository.totalSpending
            .stateIn(viewModelScope, whileSubscribed, 0)

        streakInfo = repository.resultSequence.map { results ->
            calculateStreak(results)
        }.stateIn(viewModelScope, whileSubscribed, StreakInfo("", 0, 0, 0))

        // 同行者別集計 (カンマ区切りを分割してクライアント側で集計)
        companionStats = repository.allRecords.map { records ->
            calculateCompanionStats(records)
        }.stateIn(viewModelScope, whileSubscribed, emptyList())
    }

    fun setResultFilter(filter: String?) {
        _resultFilter.value = filter
    }

    fun insertRecord(record: GameRecord) {
        viewModelScope.launch {
            repository.insert(record)
        }
    }

    fun updateRecord(record: GameRecord) {
        viewModelScope.launch {
            repository.update(record)
        }
    }

    fun deleteRecord(record: GameRecord) {
        viewModelScope.launch {
            repository.delete(record)
        }
    }

    fun loadRecordForEdit(id: Long) {
        viewModelScope.launch {
            _editTarget.value = repository.getById(id)
        }
    }

    fun clearEditTarget() {
        _editTarget.value = null
    }

    private fun calculateStreak(results: List<String>): StreakInfo {
        if (results.isEmpty()) return StreakInfo("", 0, 0, 0)

        val currentType = results.first()
        var maxWin = 0
        var maxLose = 0
        var streak = 0
        var prevType = ""

        for (r in results) {
            if (r == prevType) {
                streak++
            } else {
                streak = 1
                prevType = r
            }
            if (r == "WIN") maxWin = maxOf(maxWin, streak)
            if (r == "LOSE") maxLose = maxOf(maxLose, streak)
        }

        var currentCount = 1
        for (i in 1 until results.size) {
            if (results[i] == currentType) currentCount++
            else break
        }

        return StreakInfo(currentType, currentCount, maxWin, maxLose)
    }

    private fun calculateCompanionStats(records: List<GameRecord>): List<CompanionStat> {
        val companionMap = mutableMapOf<String, MutableList<String>>()

        for (record in records) {
            val names = record.companions
                ?.split(",")
                ?.map { it.trim() }
                ?.filter { it.isNotBlank() }
                ?: continue

            for (name in names) {
                companionMap.getOrPut(name) { mutableListOf() }.add(record.result)
            }
        }

        return companionMap.map { (name, results) ->
            CompanionStat(
                name = name,
                wins = results.count { it == "WIN" },
                loses = results.count { it == "LOSE" },
                total = results.count { it != "CANCELLED" }
            )
        }.sortedByDescending { it.total }
    }
}
