package com.example.ballparkdiary.data.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import com.example.ballparkdiary.data.entity.GameRecord
import kotlinx.coroutines.flow.Flow

@Dao
interface GameDao {

    @Insert
    suspend fun insert(record: GameRecord)

    @Update
    suspend fun update(record: GameRecord)

    @Delete
    suspend fun delete(record: GameRecord)

    @Query("SELECT * FROM game_records WHERE id = :id")
    suspend fun getById(id: Long): GameRecord?

    @Query("SELECT * FROM game_records ORDER BY date DESC, createdAt DESC")
    fun getAllRecords(): Flow<List<GameRecord>>

    // --- トータル集計 ---

    @Query("SELECT COUNT(*) FROM game_records WHERE result != 'CANCELLED'")
    fun getTotalGames(): Flow<Int>

    @Query("SELECT COUNT(*) FROM game_records WHERE result = 'WIN'")
    fun getWinCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM game_records WHERE result = 'LOSE'")
    fun getLoseCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM game_records WHERE result = 'DRAW'")
    fun getDrawCount(): Flow<Int>

    // --- 球場別集計 ---

    @Query("""
        SELECT stadium,
               COUNT(CASE WHEN result = 'WIN' THEN 1 END) AS wins,
               COUNT(CASE WHEN result = 'LOSE' THEN 1 END) AS loses,
               COUNT(CASE WHEN result != 'CANCELLED' THEN 1 END) AS total
        FROM game_records
        GROUP BY stadium
        ORDER BY total DESC
    """)
    fun getStadiumStats(): Flow<List<StadiumStat>>

    // --- 対戦相手別集計 ---

    @Query("""
        SELECT opponent,
               COUNT(CASE WHEN result = 'WIN' THEN 1 END) AS wins,
               COUNT(CASE WHEN result = 'LOSE' THEN 1 END) AS loses,
               COUNT(CASE WHEN result != 'CANCELLED' THEN 1 END) AS total
        FROM game_records
        GROUP BY opponent
        ORDER BY total DESC
    """)
    fun getOpponentStats(): Flow<List<OpponentStat>>

    // --- 月別集計 ---

    @Query("""
        SELECT SUBSTR(date, 1, 7) AS month,
               COUNT(CASE WHEN result = 'WIN' THEN 1 END) AS wins,
               COUNT(CASE WHEN result = 'LOSE' THEN 1 END) AS loses,
               COUNT(CASE WHEN result != 'CANCELLED' THEN 1 END) AS total
        FROM game_records
        GROUP BY SUBSTR(date, 1, 7)
        ORDER BY month DESC
    """)
    fun getMonthlyStats(): Flow<List<MonthlyStat>>

    // --- 天気別勝率 ---

    @Query("""
        SELECT weather,
               COUNT(CASE WHEN result = 'WIN' THEN 1 END) AS wins,
               COUNT(CASE WHEN result = 'LOSE' THEN 1 END) AS loses,
               COUNT(CASE WHEN result != 'CANCELLED' THEN 1 END) AS total
        FROM game_records
        WHERE weather IS NOT NULL AND weather != ''
        GROUP BY weather
        ORDER BY total DESC
    """)
    fun getWeatherStats(): Flow<List<WeatherStat>>

    // --- 球場別支出集計 ---

    @Query("""
        SELECT stadium,
               SUM(ticketPrice) AS totalSpending,
               COUNT(*) AS visitCount,
               AVG(ticketPrice) AS avgPrice
        FROM game_records
        WHERE ticketPrice IS NOT NULL
        GROUP BY stadium
        ORDER BY totalSpending DESC
    """)
    fun getStadiumSpending(): Flow<List<StadiumSpending>>

    // --- 月別支出集計 ---

    @Query("""
        SELECT SUBSTR(date, 1, 7) AS month,
               SUM(ticketPrice) AS totalSpending,
               COUNT(*) AS visitCount,
               AVG(ticketPrice) AS avgPrice
        FROM game_records
        WHERE ticketPrice IS NOT NULL
        GROUP BY SUBSTR(date, 1, 7)
        ORDER BY month DESC
    """)
    fun getMonthlySpending(): Flow<List<MonthlySpending>>

    // --- 合計支出 ---

    @Query("SELECT COALESCE(SUM(ticketPrice), 0) FROM game_records WHERE ticketPrice IS NOT NULL")
    fun getTotalSpending(): Flow<Int>

    // --- 連勝・連敗計算用（日付順） ---

    @Query("SELECT result FROM game_records WHERE result IN ('WIN', 'LOSE') ORDER BY date DESC, createdAt DESC")
    fun getResultSequence(): Flow<List<String>>
}

data class StadiumStat(
    val stadium: String,
    val wins: Int,
    val loses: Int,
    val total: Int
)

data class OpponentStat(
    val opponent: String,
    val wins: Int,
    val loses: Int,
    val total: Int
)

data class MonthlyStat(
    val month: String,
    val wins: Int,
    val loses: Int,
    val total: Int
)

data class WeatherStat(
    val weather: String,
    val wins: Int,
    val loses: Int,
    val total: Int
)

data class StadiumSpending(
    val stadium: String,
    val totalSpending: Int,
    val visitCount: Int,
    val avgPrice: Int
)

data class MonthlySpending(
    val month: String,
    val totalSpending: Int,
    val visitCount: Int,
    val avgPrice: Int
)
