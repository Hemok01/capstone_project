package com.eyetoai

import android.app.Service
import android.content.Intent
import android.os.IBinder

class AppControlService : Service() {
    companion object {
        const val ACTION_RESTRICT_APP = "com.eyetoai.RESTRICT_APP"
        const val ACTION_UNRESTRICT_APP = "com.eyetoai.UNRESTRICT_APP"
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_RESTRICT_APP -> {
                val packageName = intent.getStringExtra("packageName")
                // 앱 제한 로직 구현
            }
            ACTION_UNRESTRICT_APP -> {
                val packageName = intent.getStringExtra("packageName")
                // 앱 제한 해제 로직 구현
            }
        }
        return START_STICKY
    }
}