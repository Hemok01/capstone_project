// FCMService.kt
package com.eyetoai.fcm

import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.eyetoai.AppControlService

class FCMService : FirebaseMessagingService() {
    private val db = FirebaseFirestore.getInstance()
    
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        handleMessage(remoteMessage)
    }

    private fun handleMessage(remoteMessage: RemoteMessage) {
        when (remoteMessage.data["action"]) {
            "START_MONITORING" -> startMonitoring()
            "UPDATE_RESTRICTIONS" -> updateRestrictions(remoteMessage.data)
            "RESTRICT_APP" -> restrictApp(remoteMessage.data["packageName"])
            "UNRESTRICT_APP" -> unrestrictApp(remoteMessage.data["packageName"])
            "UPDATE_TIME_LIMIT" -> updateTimeLimit(
                remoteMessage.data["packageName"],
                remoteMessage.data["limitMinutes"]?.toIntOrNull() ?: 0
            )
        }
    }


    override fun onNewToken(token: String) {
        updateDeviceToken(token)
    }

    private fun startMonitoring() {
        val intent = Intent(this, AppControlService::class.java)
        startForegroundService(intent)
    }


    private fun updateRestrictions(data: Map<String, String>) {
        val prefs = getSharedPreferences("AppControl", Context.MODE_PRIVATE)
        val restrictedApps = data["restrictedApps"]?.split(",")?.toSet() ?: setOf()
        prefs.edit().putStringSet("restrictedApps", restrictedApps).apply()
        
        val deviceId = Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
        db.collection("devices").document(deviceId)
            .update("restrictedApps", restrictedApps)
    }

    private fun updateDeviceToken(token: String) {
        val deviceId = Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
        val deviceData = hashMapOf(
            "fcmToken" to token,
            "lastUpdated" to com.google.firebase.Timestamp.now()
        )
        
        db.collection("devices").document(deviceId)
            .set(deviceData, SetOptions.merge())
    }

    private fun restrictApp(packageName: String?) {
        packageName?.let {
            val intent = Intent(this, AppControlService::class.java).apply {
                action = AppControlService.ACTION_RESTRICT_APP
                putExtra("packageName", packageName)
            }
            startService(intent)
        }
    }


    private fun unrestrictApp(packageName: String?) {
        packageName?.let {
            val intent = Intent(this, AppControlService::class.java).apply {
                action = AppControlService.ACTION_UNRESTRICT_APP
                putExtra("packageName", packageName)
            }
            startService(intent)
        }
    }


    private fun updateTimeLimit(packageName: String?, limitMinutes: Int) {
        packageName?.let {
            val prefs = getSharedPreferences("AppControl", Context.MODE_PRIVATE)
            prefs.edit().putInt("limit_$packageName", limitMinutes).apply()
        }
    }
} 