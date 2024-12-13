package com.eyetoai

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.concurrent.Executors
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.app.usage.UsageEvents
import android.view.WindowManager
import android.view.LayoutInflater
import android.view.View
import android.graphics.PixelFormat
import android.provider.Settings

class AppRestrictionModule(context: ReactApplicationContext) : 
   ReactContextBaseJavaModule(context) {
   
   private val activityManager = reactApplicationContext.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
   private val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
   private val executor = Executors.newSingleThreadExecutor()
   private val mainHandler = Handler(Looper.getMainLooper())
   private var isMonitoring = false
   private var overlayView: View? = null
   private var windowManager: WindowManager? = null

   override fun getName() = "AppRestrictionModule"


private fun checkOverlayPermission(): Boolean {
    return Settings.canDrawOverlays(reactApplicationContext)
}
   // 오버레이 표시 함수
   @ReactMethod
   fun showOverlay(promise: Promise) {
    try {
        if (!checkOverlayPermission()) {
            promise.reject("PERMISSION_DENIED", "오버레이 권한 없음")
            return
        }

        mainHandler.post {
            if (overlayView != null) {
                promise.resolve(false)
                return@post
            }
               
               val params = WindowManager.LayoutParams(
                   WindowManager.LayoutParams.MATCH_PARENT,
                   WindowManager.LayoutParams.MATCH_PARENT,
                   WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                   WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                           WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                           WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                   PixelFormat.TRANSLUCENT
               )

               overlayView = LayoutInflater.from(reactApplicationContext).inflate(R.layout.overlay_restriction, null)
               windowManager = reactApplicationContext.getSystemService(Context.WINDOW_SERVICE) as WindowManager
               windowManager?.addView(overlayView, params)
               promise.resolve(true)
           }
       } catch (e: Exception) {
           promise.reject("ERROR", e.message)
       }
   }

   // 오버레이 제거 함수
   @ReactMethod
   fun removeOverlay(promise: Promise) {
       try {
           mainHandler.post {
               overlayView?.let {
                   windowManager?.removeView(it)
                   overlayView = null
                   promise.resolve(true)
               } ?: promise.resolve(false)
           }
       } catch (e: Exception) {
           promise.reject("ERROR", e.message)
       }
   }

   @ReactMethod
   fun startMonitoring(restrictedApps: ReadableArray, promise: Promise) {
       if (isMonitoring) {
           promise.resolve(false)
           return
       }

       isMonitoring = true
       executor.execute {
           while (isMonitoring) {
               val currentApp = getCurrentForegroundApp()
               mainHandler.post {
                   sendEvent("restrictionActivated", null)
               }
               Thread.sleep(1000)
           }
       }
       promise.resolve(true)
   }

   @ReactMethod
   fun stopMonitoring(promise: Promise) {
       isMonitoring = false
       promise.resolve(true)
   }

   private fun getCurrentForegroundApp(): String {
       val endTime = System.currentTimeMillis()
       val beginTime = endTime - 1000
       
       val usageEvents = usageStatsManager.queryEvents(beginTime, endTime)
       var event = UsageEvents.Event()
       var currentApp = ""
       
       while (usageEvents.hasNextEvent()) {
           usageEvents.getNextEvent(event)
           if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
               currentApp = event.packageName
           }
       }
       return currentApp
   }

   private fun sendEvent(eventName: String, params: WritableMap?) {
       reactApplicationContext
           .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
           .emit(eventName, params)
   }

   override fun onCatalystInstanceDestroy() {
       super.onCatalystInstanceDestroy()
       // 리액트 네이티브 브릿지가 파괴될 때 정리
       isMonitoring = false
       mainHandler.post {
           overlayView?.let {
               windowManager?.removeView(it)
               overlayView = null
           }
       }
   }
}