package com.example.ballparkdiary.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "game_records")
data class GameRecord(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val date: String,              // "yyyy-MM-dd"
    val stadium: String,
    val opponent: String,
    val result: String,            // "WIN" / "LOSE" / "DRAW" / "CANCELLED"
    val myScore: Int? = null,
    val opponentScore: Int? = null,
    val memo: String = "",
    val createdAt: Long = System.currentTimeMillis()
)
