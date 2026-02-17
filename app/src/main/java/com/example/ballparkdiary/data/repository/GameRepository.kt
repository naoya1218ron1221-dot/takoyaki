package com.example.ballparkdiary.data.repository

import com.example.ballparkdiary.data.dao.GameDao
import com.example.ballparkdiary.data.dao.StadiumStat
import com.example.ballparkdiary.data.entity.GameRecord
import kotlinx.coroutines.flow.Flow

class GameRepository(private val gameDao: GameDao) {

    val allRecords: Flow<List<GameRecord>> = gameDao.getAllRecords()
    val totalGames: Flow<Int> = gameDao.getTotalGames()
    val winCount: Flow<Int> = gameDao.getWinCount()
    val loseCount: Flow<Int> = gameDao.getLoseCount()
    val drawCount: Flow<Int> = gameDao.getDrawCount()
    val stadiumStats: Flow<List<StadiumStat>> = gameDao.getStadiumStats()

    suspend fun insert(record: GameRecord) {
        gameDao.insert(record)
    }

    suspend fun delete(record: GameRecord) {
        gameDao.delete(record)
    }
}
