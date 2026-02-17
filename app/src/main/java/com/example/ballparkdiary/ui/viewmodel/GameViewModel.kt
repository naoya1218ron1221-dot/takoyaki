package com.example.ballparkdiary.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.ballparkdiary.data.dao.StadiumStat
import com.example.ballparkdiary.data.database.AppDatabase
import com.example.ballparkdiary.data.entity.GameRecord
import com.example.ballparkdiary.data.repository.GameRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class GameViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: GameRepository

    val allRecords: StateFlow<List<GameRecord>>
    val totalGames: StateFlow<Int>
    val winCount: StateFlow<Int>
    val loseCount: StateFlow<Int>
    val drawCount: StateFlow<Int>
    val stadiumStats: StateFlow<List<StadiumStat>>

    init {
        val dao = AppDatabase.getDatabase(application).gameDao()
        repository = GameRepository(dao)

        allRecords = repository.allRecords
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
        totalGames = repository.totalGames
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)
        winCount = repository.winCount
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)
        loseCount = repository.loseCount
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)
        drawCount = repository.drawCount
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)
        stadiumStats = repository.stadiumStats
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    }

    fun insertRecord(record: GameRecord) {
        viewModelScope.launch {
            repository.insert(record)
        }
    }

    fun deleteRecord(record: GameRecord) {
        viewModelScope.launch {
            repository.delete(record)
        }
    }
}
