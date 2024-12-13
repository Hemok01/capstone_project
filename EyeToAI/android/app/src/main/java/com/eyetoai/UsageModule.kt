package com.eyetoai

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.*
import java.util.*
import android.content.pm.ApplicationInfo
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.SetOptions
import java.text.SimpleDateFormat
import android.util.Log
import kotlinx.coroutines.*

class UsageModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val context = reactContext
    private val scope = CoroutineScope(Dispatchers.IO + Job())
    private val deviceId = "android-1732956908781-54dxjp5yh"
    private val db = FirebaseFirestore.getInstance()

    companion object {
        private var blockedAppsCache: List<String> = emptyList()
        private var appUsagesCache: List<Map<String, Any>> = emptyList()
        private var installedAppsCache: List<Map<String, Any>> = emptyList()
        private var totalUsageTimeCache: Int = 0
        private var totalTimeLimitCache: Int = 0

        fun getCachedBlockedApps(): List<String> = blockedAppsCache
        fun getCachedAppUsages(): List<Map<String, Any>> = appUsagesCache
        fun getCachedInstalledApps(): List<Map<String, Any>> = installedAppsCache
        fun getCachedTotalUsageTime(): Int = totalUsageTimeCache
        fun getCachedTotalTimeLimit(): Int = totalTimeLimitCache

        fun updateBlockedAppsCache(apps: List<String>) {
            blockedAppsCache = apps
        }
        fun updateAppUsagesCache(usages: List<Map<String, Any>>) {
            appUsagesCache = usages
        }
        fun updateInstalledAppsCache(apps: List<Map<String, Any>>) {
            installedAppsCache = apps
        }
        fun updateTotalUsageTimeCache(totalUsageTime: Int) {
            totalUsageTimeCache = totalUsageTime
        }
        fun updateTotalTimeLimitCache(totalTimeLimit: Int) {
            totalTimeLimitCache = totalTimeLimit
        }
    }

    override fun getName(): String = "UsageModule"

    @ReactMethod
    fun checkPermission(promise: Promise) {
        try {
            val appOpsManager = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = appOpsManager.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                context.packageName
            )
            promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getCachedTotalTimeLimit(promise: Promise) {
        try {
            promise.resolve(getCachedTotalTimeLimit())
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun updateTotalTimeLimit(value: Int, promise: Promise) {
        try {
            updateTotalTimeLimitCache(value)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getCachedTotalUsageTime(promise: Promise) {
        try {
            promise.resolve(getCachedTotalUsageTime())
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun openUsageSettings() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }

      @ReactMethod
    fun fetchInstalledApps(promise: Promise) {
        try {
            // Firebase에서 앱 목록 가져오기 로직 구현
            val installedApps = listOf(
                mapOf("packageName" to "com.example.app", "appName" to "Example App")
            )
            val result = Arguments.createArray()
            installedApps.forEach { app ->
                val map = Arguments.createMap()
                map.putString("packageName", app["packageName"] as String?)
                map.putString("appName", app["appName"] as String?)
                result.pushMap(map)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
    

    @ReactMethod
    fun getUsageStats(days: Int, promise: Promise) {
        try {
            val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val calendar = Calendar.getInstance().apply {
                add(Calendar.DAY_OF_YEAR, -days)
            }

            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                calendar.timeInMillis,
                System.currentTimeMillis()
            )

            val usageData = Arguments.createArray()
            stats.filter { it.totalTimeInForeground > 0 }
                .forEach { stat ->
                    Arguments.createMap().apply {
                        putString("packageName", stat.packageName)
                        putString("category", getAppCategory(stat.packageName))
                        putDouble("totalTimeInForeground", stat.totalTimeInForeground.toDouble())
                        putDouble("firstTimeStamp", stat.firstTimeStamp.toDouble())
                        putDouble("lastTimeStamp", stat.lastTimeStamp.toDouble())
                        usageData.pushMap(this)
                    }
                }

            promise.resolve(usageData)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    private fun getAppCategory(packageName: String): String {
        return try {
            val pm = context.packageManager
            val ai = pm.getApplicationInfo(packageName, 0)
            ai.category?.toString() ?: "UNKNOWN"
        } catch (e: Exception) {
            "UNKNOWN"
        }
    }

    private fun getAppName(packageName: String): String {
        return try {
            val pm = context.packageManager
            val ai = pm.getApplicationInfo(packageName, 0)
            pm.getApplicationLabel(ai).toString()
        } catch (e: Exception) {
            packageName
        }
    }

    @ReactMethod
    fun processUsageStats(stats: ReadableArray, promise: Promise) {
        scope.launch {
            try {
                val consolidatedStats = mutableMapOf<String, WritableMap>()
                
                for (i in 0 until stats.size()) {
                    val stat = stats.getMap(i)
                    val packageName = stat?.getString("packageName") ?: continue
                    val appName = getAppName(packageName)
                    val key = "${appName}_${packageName}"

                    val usageTime = stat.getDouble("totalTimeInForeground") / 60000
                    val firstTimeStamp = stat.getDouble("firstTimeStamp")
                    val lastTimeStamp = stat.getDouble("lastTimeStamp")

                    consolidatedStats[key]?.let { existing ->
                        existing.putDouble("usageTime", existing.getDouble("usageTime") + usageTime)
                        existing.putDouble("firstTimeStamp", minOf(existing.getDouble("firstTimeStamp"), firstTimeStamp))
                        existing.putDouble("lastTimeStamp", maxOf(existing.getDouble("lastTimeStamp"), lastTimeStamp))
                    } ?: run {
                        Arguments.createMap().apply {
                            putString("appName", appName)
                            putString("packageName", packageName)
                            putString("category", stat.getString("category"))
                            putDouble("usageTime", usageTime)
                            putDouble("firstTimeStamp", firstTimeStamp)
                            putDouble("lastTimeStamp", lastTimeStamp)
                            consolidatedStats[key] = this
                        }
                    }
                }

                val result = Arguments.createArray()
                consolidatedStats.values.forEach { result.pushMap(it) }
                withContext(Dispatchers.Main) {
                    promise.resolve(result)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    promise.reject("ERROR", e.message)
                }
            }
        }
    }

    @ReactMethod
    fun getBlockedApps(promise: Promise) {
        try {
            val result = Arguments.createArray()
            blockedAppsCache.forEach { result.pushString(it) }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getCachedInstalledApps(promise: Promise) {
        try {
            val result = Arguments.createArray()
            installedAppsCache.forEach { app ->
                Arguments.createMap().apply {
                    putString("packageName", app["packageName"] as? String)
                    putString("appName", app["appName"] as? String)
                    result.pushMap(this)
                }
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun updateBlockedApps(blockedApps: ReadableArray, promise: Promise) {
        try {
            val apps = blockedApps.toArrayList().map { it.toString() }
            updateBlockedAppsCache(apps)

            db.collection("apps").document(deviceId)
                .set(mapOf("blockedApps" to apps), SetOptions.merge())
                .addOnSuccessListener { promise.resolve(true) }
                .addOnFailureListener { e -> promise.reject("ERROR", e.message) }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun updateAppUsages(appUsages: ReadableArray, promise: Promise) {
        try {
            val usages = appUsages.toArrayList().mapNotNull { it as? Map<String, Any> }
            updateAppUsagesCache(usages)

            val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
            db.collection("usage").document("${deviceId}_$today")
                .set(mapOf("appUsages" to usages), SetOptions.merge())
                .addOnSuccessListener { promise.resolve(true) }
                .addOnFailureListener { e -> promise.reject("ERROR", e.message) }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun setTotalTimeLimit(timeLimit: Int, promise: Promise) {
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        val data = mapOf(
            "timeLimit" to timeLimit,
            "updatedAt" to FieldValue.serverTimestamp()
        )

        db.collection("usage").document("${deviceId}_$today").set(data, SetOptions.merge())
            .addOnSuccessListener {
                updateTotalTimeLimitCache(timeLimit)
                promise.resolve(true)
            }
            .addOnFailureListener { e -> promise.reject("ERROR", "Failed to save time limit: ${e.message}") }
    }

    @ReactMethod
    fun getUsageByDate(date: String, promise: Promise) {
        val documentId = "${deviceId}_$date"
        db.collection("usage").document(documentId).get()
            .addOnSuccessListener { snapshot ->
                try {
                    val data = Arguments.createMap().apply {
                        putInt("usageTime", snapshot.getLong("usageTime")?.toInt() ?: 0)
                        putInt("timeLimit", snapshot.getLong("timeLimit")?.toInt() ?: 0)

                        val appUsages = Arguments.createArray()
                        @Suppress("UNCHECKED_CAST")
                        (snapshot.get("appUsages") as? List<Map<String, Any>>)?.forEach { app ->
                            Arguments.createMap().apply {
                                putString("appName", app["appName"] as? String)
                                putString("packageName", app["packageName"] as? String)
                                putInt("usageTime", (app["usageTime"] as? Long)?.toInt() ?: 0)
                                appUsages.pushMap(this)
                            }
                        }
                        putArray("appUsages", appUsages)
                    }
                    promise.resolve(data)
                } catch (e: Exception) {
                    promise.reject("ERROR", e.message)
                }
            }
            .addOnFailureListener { e -> promise.reject("ERROR", e.message) }
    }

    override fun onCatalystInstanceDestroy() {
        scope.cancel()
        super.onCatalystInstanceDestroy()
    }
}