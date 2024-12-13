package com.eyetoai

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Intent
import android.graphics.PixelFormat
import android.net.Uri
import android.os.IBinder
import android.provider.Settings
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.TextView
import androidx.core.app.NotificationCompat
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.*
import java.text.SimpleDateFormat
import java.util.*
import android.app.AppOpsManager
import com.eyetoai.UsageModule

class TimeRestrictService : Service() {
    private lateinit var database: FirebaseFirestore
    private var monitoringJob: Job? = null
    private var overlayView: View? = null
    private var windowManager: WindowManager? = null
    private var deviceId: String = "android-1732956908781-54dxjp5yh"

    override fun onCreate() {
        super.onCreate()
        Log.d("AppLifecycle", "[서비스] TimeRestrictService onCreate()")

        if (!hasUsageStatsPermission()) {
            requestUsageStatsPermission()
            Log.d("AppLifecycle", "Usage Stats 권한 요청")
        }

        initializeFirebase()
        initializeTimeListener()
        startForeground(1, createNotification())
        startForegroundAppMonitor()
        Log.d("AppLifecycle", "[서비스] Foreground 서비스 시작")
    }

private fun startForegroundAppMonitor() {
    monitoringJob = CoroutineScope(Dispatchers.IO).launch {
        while (isActive) {
            val currentApp = getForegroundApp()
            Log.d("TimeRestrictService", "현재 포그라운드 앱: $currentApp")

            // Blocked Apps 처리
            val blockedApps = UsageModule.getCachedBlockedApps()
            val normalizedCurrentApp = currentApp?.trim()?.lowercase(Locale.getDefault())
            val normalizedBlockedApps = blockedApps.map { it.trim().lowercase(Locale.getDefault()) }

            if (normalizedCurrentApp != null && normalizedBlockedApps.contains(normalizedCurrentApp)) {
                Log.d("TimeRestrictService", "오버레이 표시 조건 충족 - 차단된 앱: $currentApp")
                showOverlay("앱 사용 차단됨")
            } else {
                Log.d("TimeRestrictService", "차단된 앱 아님: $currentApp")
                removeOverlay()
            }

            // App Usages 처리
            val appUsages = UsageModule.getCachedAppUsages()
            appUsages.forEach { usage ->
                val packageName = usage["packageName"] as? String
                val timeLimit = (usage["timeLimit"] as? Int) ?: 0
                val usageTime = (usage["usageTime"] as? Int) ?: 0

                if (packageName == currentApp && usageTime > timeLimit && timeLimit > 0) {
                    Log.d("TimeRestrictService", "오버레이 표시 조건 충족 - 앱 시간 초과: $currentApp")
                    showOverlay("앱 시간 초과")
                }
            }

            // Total Time Limit 처리
            val totalUsageTime = UsageModule.getCachedTotalUsageTime() // 총 사용 시간
            val totalTimeLimit = UsageModule.getCachedTotalTimeLimit() // 총 시간 제한

            if (totalTimeLimit > 0 && totalUsageTime > totalTimeLimit) {
                Log.d("TimeRestrictService", "오버레이 표시 조건 충족 - 전체 시간 초과")
                showOverlay("오늘의 사용 시간 초과")
            }

            delay(5000) // 5초마다 실행
        }
    }
}


    private fun initializeFirebase() {
        if (FirebaseApp.getApps(this).isEmpty()) {
            FirebaseApp.initializeApp(this, FirebaseOptions.Builder()
                .setApiKey("AIzaSyAEkJGdvEOCHceuGTiAKWbB_-KepA-RWZo")
                .setApplicationId("1:598185887142:android:d5e9a9b3ed2d14caf9fb67")
                .setProjectId("eyetoai")
                .setStorageBucket("eyetoai.appspot.com")
                .build()
            )
        }
        database = FirebaseFirestore.getInstance()
        Log.d("AppLifecycle", "[Firebase] 초기화 완료")
    }

    private fun initializeTimeListener() {
    val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

    // Total Time Limit & Usage Fetch
    database.collection("usage").document("${deviceId}_$today")
        .addSnapshotListener { snapshot, error ->
            if (error != null) {
                Log.e("TimeRestrictService", "Firestore error: ${error.message}")
                return@addSnapshotListener
            }

            val totalUsageTime = (snapshot?.get("usageTime") as? Long)?.toInt() ?: 0
            val totalTimeLimit = (snapshot?.get("timeLimit") as? Long)?.toInt() ?: 0

            Log.d("TimeRestrictService", "총 사용 시간 업데이트: $totalUsageTime")
            Log.d("TimeRestrictService", "총 시간 제한 업데이트: $totalTimeLimit")

            UsageModule.updateTotalUsageTimeCache(totalUsageTime)
            UsageModule.updateTotalTimeLimitCache(totalTimeLimit)
        }
}


    private fun hasUsageStatsPermission(): Boolean {
        val appOpsManager = getSystemService(APP_OPS_SERVICE) as AppOpsManager
        val mode = appOpsManager.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            android.os.Process.myUid(),
            packageName
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }

    private fun requestUsageStatsPermission() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        startActivity(intent)
    }

    private fun getForegroundApp(): String? {
        val usageStatsManager = getSystemService(USAGE_STATS_SERVICE) as UsageStatsManager
        val endTime = System.currentTimeMillis()
        val startTime = endTime - 6000 // 10초 전부터 이벤트 확인

        val usageEvents = usageStatsManager.queryEvents(startTime, endTime)
        val event = UsageEvents.Event()
        var lastResumedApp: String? = null
        var lastEventTime = 0L

        while (usageEvents.hasNextEvent()) {
            usageEvents.getNextEvent(event)
            if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED) {
                if (event.timeStamp > lastEventTime) {
                    lastEventTime = event.timeStamp
                    lastResumedApp = event.packageName
                }
            }
        }

        return lastResumedApp
    }

        private fun hasOverlayPermission(): Boolean {
        return Settings.canDrawOverlays(this)
    }

    private fun requestOverlayPermission() {
        val intent = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:$packageName")
        )
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        startActivity(intent)
    }

 private fun showOverlay(message: String) {
    if (!hasOverlayPermission()) {
        Log.e("TimeRestrictService", "오버레이 권한 없음. 요청 진행 중...")
        requestOverlayPermission()
        return
    }

    if (overlayView != null) {
        Log.d("TimeRestrictService", "오버레이가 이미 표시 중입니다.")
        return
    }

    CoroutineScope(Dispatchers.Main).launch {
        try {
            val params = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                PixelFormat.TRANSLUCENT
            )

            overlayView = LayoutInflater.from(this@TimeRestrictService)
                .inflate(R.layout.overlay_restriction, null).apply {
                    findViewById<TextView>(R.id.overlay_message)?.text = message
                }

            windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
            windowManager?.addView(overlayView, params)
            Log.d("TimeRestrictService", "오버레이 추가 성공")
        } catch (e: Exception) {
            Log.e("TimeRestrictService", "오버레이 추가 실패: ${e.message}")
        }
    }
}




    private fun removeOverlay() {
    if (overlayView == null) {
        Log.d("TimeRestrictService", "오버레이가 이미 제거된 상태입니다.")
        return
    }

    try {
        windowManager?.removeView(overlayView)
        overlayView = null
        Log.d("TimeRestrictService", "오버레이 제거 성공")
    } catch (e: Exception) {
        Log.e("TimeRestrictService", "오버레이 제거 실패: ${e.message}")
    }
}


    override fun onDestroy() {
        monitoringJob?.cancel()
        removeOverlay()
        super.onDestroy()
    }

    private fun createNotification(): Notification {
        val channelId = "time_restrict"
        val channelName = "Time Restriction Service"
        val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager

        if (notificationManager.getNotificationChannel(channelId) == null) {
            val channel = NotificationChannel(
                channelId, channelName, NotificationManager.IMPORTANCE_LOW
            )
            notificationManager.createNotificationChannel(channel)
        }

        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("Time Restriction Active")
            .setSmallIcon(R.drawable.ic_notification)
            .build()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
