package com.example.ballparkdiary.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.ballparkdiary.ui.screen.AddGameScreen
import com.example.ballparkdiary.ui.screen.HistoryScreen
import com.example.ballparkdiary.ui.screen.StatsScreen
import com.example.ballparkdiary.ui.viewmodel.GameViewModel

sealed class Screen(val route: String, val label: String, val icon: ImageVector) {
    data object History : Screen("history", "戦績一覧", Icons.Default.Home)
    data object AddGame : Screen("add_game", "試合登録", Icons.Default.Add)
    data object Stats : Screen("stats", "データ分析", Icons.Default.Info)
}

private val bottomNavItems = listOf(Screen.History, Screen.AddGame, Screen.Stats)

@Composable
fun AppNavigation(viewModel: GameViewModel) {
    val navController = rememberNavController()

    Scaffold(
        bottomBar = {
            NavigationBar {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = navBackStackEntry?.destination

                bottomNavItems.forEach { screen ->
                    NavigationBarItem(
                        icon = { Icon(screen.icon, contentDescription = screen.label) },
                        label = { Text(screen.label) },
                        selected = currentDestination?.hierarchy?.any { it.route == screen.route } == true,
                        onClick = {
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.History.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            // 戦績一覧
            composable(Screen.History.route) {
                HistoryScreen(
                    viewModel = viewModel,
                    onEditRecord = { recordId ->
                        viewModel.loadRecordForEdit(recordId)
                        navController.navigate("edit_game/$recordId")
                    }
                )
            }

            // 新規登録
            composable(Screen.AddGame.route) {
                AddGameScreen(
                    viewModel = viewModel,
                    editRecord = null,
                    onSaved = {
                        navController.navigate(Screen.History.route) {
                            popUpTo(navController.graph.findStartDestination().id) {
                                saveState = true
                            }
                            launchSingleTop = true
                        }
                    }
                )
            }

            // 編集画面
            composable(
                route = "edit_game/{recordId}",
                arguments = listOf(navArgument("recordId") { type = NavType.LongType })
            ) {
                val editTarget by viewModel.editTarget.collectAsStateWithLifecycle()

                editTarget?.let { record ->
                    AddGameScreen(
                        viewModel = viewModel,
                        editRecord = record,
                        onSaved = {
                            viewModel.clearEditTarget()
                            navController.popBackStack()
                        }
                    )
                }
            }

            // データ分析
            composable(Screen.Stats.route) {
                StatsScreen(viewModel = viewModel)
            }
        }
    }
}
