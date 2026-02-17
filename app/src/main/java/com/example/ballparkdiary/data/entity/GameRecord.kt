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
    val seatInfo: String? = null,  // 座席情報 ("内野A指定席 1塁側" など)
    val ticketPrice: Int? = null,  // チケット代 (円)
    val weather: String? = null,   // "晴れ" / "曇り" / "雨" / "ドーム" / "その他"
    val companions: String? = null,// 同行者 (カンマ区切り: "太郎,花子")
    val memo: String = "",
    val createdAt: Long = System.currentTimeMillis()
)
