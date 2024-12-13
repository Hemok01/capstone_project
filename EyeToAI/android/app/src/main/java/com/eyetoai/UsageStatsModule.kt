// android/app/src/main/java/com/yourapp/UsageStatsModule.kt

package com.eyetoai

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Process
import android.provider.Settings
import com.facebook.react.bridge.*
import java.util.*
import android.content.pm.ApplicationInfo



class UsageStatsModule(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "UsageStatsModule"



@ReactMethod
fun checkPermission(promise: Promise) {
    try {
        val packageManager = reactContext.packageManager
        val packageName = reactContext.packageName
        
        val usageStatsManager = reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val end = System.currentTimeMillis()
        val start = end - 1000 * 60  // 최근 1분
        
        // 실제 사용 정보에 접근을 시도하여 권한 상태 확인
        val usageEvents = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, start, end)
        val granted = !usageEvents.isNullOrEmpty()
        
        promise.resolve(granted)
    } catch (e: Exception) {
        promise.resolve(false)
    }
}

    @ReactMethod
    fun openUsageSettings() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactContext.startActivity(intent)
    }

    @ReactMethod
fun getUsageStats(days: Int, promise: Promise) {
    try {
        val usageStatsManager = reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        
        val calendar = Calendar.getInstance().apply {
            add(Calendar.DAY_OF_YEAR, -days)
        }
        
        val startTime = calendar.timeInMillis
        val endTime = System.currentTimeMillis()

        val stats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            startTime,
            endTime
        )

        val usageData = Arguments.createArray()

        stats
            .filter { it.totalTimeInForeground > 0 }
            .forEach { stat ->
                Arguments.createMap().apply {
                    putString("packageName", stat.packageName)
                    putString("category", getAppCategory(stat.packageName))
                    putDouble("lastTimeUsed", stat.lastTimeUsed.toDouble())
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

    @ReactMethod
    fun getAppName(packageName: String, promise: Promise) {
        try {
            val packageManager = reactContext.packageManager
            val applicationInfo = packageManager.getApplicationInfo(packageName, 0)
            val appName = packageManager.getApplicationLabel(applicationInfo).toString()
            promise.resolve(appName)
        } catch (e: Exception) {
            promise.resolve(packageName) // 앱 이름을 가져올 수 없는 경우 패키지명 반환
        }
    }

    
    fun getAppCategory(packageName: String): String {
    try {
        val pm = reactContext.packageManager
        val ai = pm.getApplicationInfo(packageName, 0)
        return ai.category.toString()
    } catch (e: Exception) {
        return "UNKNOWN"
    }
}



}

    
