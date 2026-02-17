package com.example.ballparkdiary

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.ViewModelProvider
import com.example.ballparkdiary.ui.navigation.AppNavigation
import com.example.ballparkdiary.ui.theme.BallparkDiaryTheme
import com.example.ballparkdiary.ui.viewmodel.GameViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val viewModel = ViewModelProvider(this)[GameViewModel::class.java]

        setContent {
            BallparkDiaryTheme {
                AppNavigation(viewModel = viewModel)
            }
        }
    }
}
