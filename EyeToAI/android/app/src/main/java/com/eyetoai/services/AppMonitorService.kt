package services

import android.app.Service
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.Gravity
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import androidx.core.app.NotificationCompat
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager

class AppMonitorService : Service() {
    private val CHANNEL_ID = "AppMonitor"
    private val NOTIFICATION_ID = 1
    private lateinit var windowManager: WindowManager
    private val handler = Handler(Looper.getMainLooper())

    private val usageStatsManager by lazy {
        getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    }   

   // AppMonitorService.kt의 companion object 수정
companion object {
    const val CHECK_INTERVAL = 1000L // 1초
    const val ACTION_RESTRICT_APP = "com.eyetoai.RESTRICT_APP"
    const val ACTION_UNRESTRICT_APP = "com.eyetoai.UNRESTRICT_APP"
}


    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, createNotification())
        startMonitoring()
    }


    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_RESTRICT_APP -> {
                intent.getStringExtra("packageName")?.let { packageName ->
                    addRestrictedApp(packageName)
                }
            }
            ACTION_UNRESTRICT_APP -> {
                intent.getStringExtra("packageName")?.let { packageName ->
                    removeRestrictedApp(packageName)
                }
            }
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "App Control Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("App Control Active")
            .setContentText("Monitoring app usage")
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    
    private fun startMonitoring() {
        handler.postDelayed(object : Runnable {
            override fun run() {
                checkCurrentApp()
                handler.postDelayed(this, CHECK_INTERVAL)
            }
        }, CHECK_INTERVAL)
    }

    private fun checkCurrentApp() {
        val time = System.currentTimeMillis()
        val event = UsageEvents.Event()
        val usageEvents = usageStatsManager.queryEvents(time - 1000, time)
        var currentApp: String? = null

        while (usageEvents.hasNextEvent()) {
            usageEvents.getNextEvent(event)
            if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                currentApp = event.packageName
            }
        }

        currentApp?.let { packageName ->
            if (isAppRestricted(packageName)) {
                showBlockingScreen()
            }
        }
    }


    private fun showBlockingScreen() {
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        )

        val view = LinearLayout(this).apply {
            setBackgroundColor(0xCC000000.toInt())
            gravity = Gravity.CENTER

            addView(Button(context).apply {
                text = "앱 사용이 제한되었습니다"
                setOnClickListener {
                    val homeIntent = Intent(Intent.ACTION_MAIN).apply {
                        addCategory(Intent.CATEGORY_HOME)
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    startActivity(homeIntent)
                }
            })
        }

        try {
            windowManager.addView(view, params)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun isAppRestricted(packageName: String): Boolean {
        val prefs = getSharedPreferences("AppControl", Context.MODE_PRIVATE)
        val restrictedApps = prefs.getStringSet("restrictedApps", setOf()) ?: setOf()
        return restrictedApps.contains(packageName)
    }


    private fun addRestrictedApp(packageName: String) {
        val prefs = getSharedPreferences("AppControl", Context.MODE_PRIVATE)
        val restrictedApps = prefs.getStringSet("restrictedApps", setOf())?.toMutableSet() ?: mutableSetOf()
        restrictedApps.add(packageName)
        prefs.edit().putStringSet("restrictedApps", restrictedApps).apply()
    }


    private fun removeRestrictedApp(packageName: String) {
        val prefs = getSharedPreferences("AppControl", Context.MODE_PRIVATE)
        val restrictedApps = prefs.getStringSet("restrictedApps", setOf())?.toMutableSet() ?: mutableSetOf()
        restrictedApps.remove(packageName)
        prefs.edit().putStringSet("restrictedApps", restrictedApps).apply()
    }
}