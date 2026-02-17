package com.example.ballparkdiary.data.repository

import com.example.ballparkdiary.data.dao.GameDao
import com.example.ballparkdiary.data.dao.MonthlyStat
import com.example.ballparkdiary.data.dao.MonthlySpending
import com.example.ballparkdiary.data.dao.OpponentStat
import com.example.ballparkdiary.data.dao.StadiumSpending
import com.example.ballparkdiary.data.dao.StadiumStat
import com.example.ballparkdiary.data.dao.WeatherStat
import com.example.ballparkdiary.data.entity.GameRecord
import kotlinx.coroutines.flow.Flow

class GameRepository(private val gameDao: GameDao) {

    val allRecords: Flow<List<GameRecord>> = gameDao.getAllRecords()
    val totalGames: Flow<Int> = gameDao.getTotalGames()
    val winCount: Flow<Int> = gameDao.getWinCount()
    val loseCount: Flow<Int> = gameDao.getLoseCount()
    val drawCount: Flow<Int> = gameDao.getDrawCount()
    val stadiumStats: Flow<List<StadiumStat>> = gameDao.getStadiumStats()
    val opponentStats: Flow<List<OpponentStat>> = gameDao.getOpponentStats()
    val monthlyStats: Flow<List<MonthlyStat>> = gameDao.getMonthlyStats()
    val weatherStats: Flow<List<WeatherStat>> = gameDao.getWeatherStats()
    val stadiumSpending: Flow<List<StadiumSpending>> = gameDao.getStadiumSpending()
    val monthlySpending: Flow<List<MonthlySpending>> = gameDao.getMonthlySpending()
    val totalSpending: Flow<Int> = gameDao.getTotalSpending()
    val resultSequence: Flow<List<String>> = gameDao.getResultSequence()

    suspend fun insert(record: GameRecord) {
        gameDao.insert(record)
    }

    suspend fun update(record: GameRecord) {
        gameDao.update(record)
    }

    suspend fun delete(record: GameRecord) {
        gameDao.delete(record)
    }

    suspend fun getById(id: Long): GameRecord? {
        return gameDao.getById(id)
    }
}
