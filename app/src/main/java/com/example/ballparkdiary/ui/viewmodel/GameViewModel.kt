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
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class StreakInfo(
    val currentType: String,
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

sealed class UiEvent {
    data class ShowSnackbar(val message: String) : UiEvent()
}

class GameViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: GameRepository

    // UI イベント
    private val _uiEvent = MutableSharedFlow<UiEvent>()
    val uiEvent = _uiEvent.asSharedFlow()

    // フィルター状態
    private val _resultFilter = MutableStateFlow<String?>(null)
    val resultFilter: StateFlow<String?> = _resultFilter.asStateFlow()

    // 検索クエリ
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    // 年度フィルター
    private val _yearFilter = MutableStateFlow<String?>(null)
    val yearFilter: StateFlow<String?> = _yearFilter.asStateFlow()

    // 編集対象
    private val _editTarget = MutableStateFlow<GameRecord?>(null)
    val editTarget: StateFlow<GameRecord?> = _editTarget.asStateFlow()

    // 詳細表示対象
    private val _detailTarget = MutableStateFlow<GameRecord?>(null)
    val detailTarget: StateFlow<GameRecord?> = _detailTarget.asStateFlow()

    // データ
    val allRecords: StateFlow<List<GameRecord>>
    val filteredRecords: StateFlow<List<GameRecord>>
    val availableYears: StateFlow<List<String>>
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

        // 利用可能な年度リスト
        availableYears = repository.allRecords.map { records ->
            records.map { it.date.take(4) }.distinct().sorted().reversed()
        }.stateIn(viewModelScope, whileSubscribed, emptyList())

        // 検索 + 勝敗フィルター + 年度フィルターを複合適用
        filteredRecords = combine(
            repository.allRecords, _resultFilter, _searchQuery, _yearFilter
        ) { records, resultF, query, yearF ->
            records.filter { record ->
                val matchResult = resultF == null || record.result == resultF
                val matchYear = yearF == null || record.date.startsWith(yearF)
                val matchQuery = query.isBlank() || record.stadium.contains(query, true)
                        || record.opponent.contains(query, true)
                        || record.memo.contains(query, true)
                        || (record.companions?.contains(query, true) == true)
                        || (record.seatInfo?.contains(query, true) == true)
                matchResult && matchYear && matchQuery
            }
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

        companionStats = repository.allRecords.map { records ->
            calculateCompanionStats(records)
        }.stateIn(viewModelScope, whileSubscribed, emptyList())
    }

    fun setResultFilter(filter: String?) { _resultFilter.value = filter }
    fun setSearchQuery(query: String) { _searchQuery.value = query }
    fun setYearFilter(year: String?) { _yearFilter.value = year }

    fun insertRecord(record: GameRecord) {
        viewModelScope.launch {
            repository.insert(record)
            _uiEvent.emit(UiEvent.ShowSnackbar("記録を保存しました"))
        }
    }

    fun updateRecord(record: GameRecord) {
        viewModelScope.launch {
            repository.update(record)
            _uiEvent.emit(UiEvent.ShowSnackbar("記録を更新しました"))
        }
    }

    fun deleteRecord(record: GameRecord) {
        viewModelScope.launch {
            repository.delete(record)
            _uiEvent.emit(UiEvent.ShowSnackbar("記録を削除しました"))
        }
    }

    fun loadRecordForEdit(id: Long) {
        viewModelScope.launch { _editTarget.value = repository.getById(id) }
    }

    fun clearEditTarget() { _editTarget.value = null }

    fun showDetail(record: GameRecord) { _detailTarget.value = record }
    fun clearDetail() { _detailTarget.value = null }

    fun getStadiumVisitCount(stadium: String, records: List<GameRecord>): Int {
        return records.count { it.stadium == stadium }
    }

    private fun calculateStreak(results: List<String>): StreakInfo {
        if (results.isEmpty()) return StreakInfo("", 0, 0, 0)
        val currentType = results.first()
        var maxWin = 0; var maxLose = 0; var streak = 0; var prevType = ""
        for (r in results) {
            if (r == prevType) streak++ else { streak = 1; prevType = r }
            if (r == "WIN") maxWin = maxOf(maxWin, streak)
            if (r == "LOSE") maxLose = maxOf(maxLose, streak)
        }
        var currentCount = 1
        for (i in 1 until results.size) {
            if (results[i] == currentType) currentCount++ else break
        }
        return StreakInfo(currentType, currentCount, maxWin, maxLose)
    }

    private fun calculateCompanionStats(records: List<GameRecord>): List<CompanionStat> {
        val map = mutableMapOf<String, MutableList<String>>()
        for (record in records) {
            record.companions?.split(",")?.map { it.trim() }?.filter { it.isNotBlank() }
                ?.forEach { name -> map.getOrPut(name) { mutableListOf() }.add(record.result) }
        }
        return map.map { (name, results) ->
            CompanionStat(name, results.count { it == "WIN" }, results.count { it == "LOSE" },
                results.count { it != "CANCELLED" })
        }.sortedByDescending { it.total }
    }
}
