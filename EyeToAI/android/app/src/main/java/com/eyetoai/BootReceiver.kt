package com.eyetoai


import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.eyetoai.TimeRestrictService
import android.util.Log


class BootReceiver : BroadcastReceiver() {
override fun onReceive(context: Context, intent: Intent) {
    Log.d("AppLifecycle", "[부팅] BootReceiver 실행됨")
    if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
        try {
            val serviceIntent = Intent(context, TimeRestrictService::class.java)
            context.startForegroundService(serviceIntent) // Foreground 서비스 시작
            Log.d("AppLifecycle", "[부팅] TimeRestrictService 시작 요청")
        } catch (e: Exception) {
            Log.e("AppLifecycle", "[부팅] 서비스 시작 오류: ${e.message}")
        }
    }
}

}