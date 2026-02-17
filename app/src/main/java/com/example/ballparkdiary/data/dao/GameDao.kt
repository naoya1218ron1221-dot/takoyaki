package com.example.ballparkdiary.data.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import com.example.ballparkdiary.data.entity.GameRecord
import kotlinx.coroutines.flow.Flow

@Dao
interface GameDao {

    @Insert
    suspend fun insert(record: GameRecord)

    @Delete
    suspend fun delete(record: GameRecord)

    @Query("SELECT * FROM game_records ORDER BY date DESC")
    fun getAllRecords(): Flow<List<GameRecord>>

    @Query("SELECT COUNT(*) FROM game_records WHERE result != 'CANCELLED'")
    fun getTotalGames(): Flow<Int>

    @Query("SELECT COUNT(*) FROM game_records WHERE result = 'WIN'")
    fun getWinCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM game_records WHERE result = 'LOSE'")
    fun getLoseCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM game_records WHERE result = 'DRAW'")
    fun getDrawCount(): Flow<Int>

    @Query("""
        SELECT stadium,
               COUNT(CASE WHEN result = 'WIN' THEN 1 END) AS wins,
               COUNT(CASE WHEN result != 'CANCELLED' THEN 1 END) AS total
        FROM game_records
        GROUP BY stadium
        ORDER BY total DESC
    """)
    fun getStadiumStats(): Flow<List<StadiumStat>>
}

data class StadiumStat(
    val stadium: String,
    val wins: Int,
    val total: Int
)
