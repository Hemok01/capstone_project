package com.eyetoai

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.os.Bundle
import android.content.Context
import android.content.Intent
import android.app.ActivityManager
import com.eyetoai.TimeRestrictService
import android.util.Log

class MainActivity : ReactActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)


   if (!isServiceRunning(TimeRestrictService::class.java)) {
       startForegroundService(Intent(this, TimeRestrictService::class.java)) 
   }   
    }

    override fun getMainComponentName(): String = "EyeToAI"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)



private fun isServiceRunning(serviceClass: Class<*>): Boolean {
   return try {
       val manager = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
       for (service in manager.getRunningServices(Integer.MAX_VALUE)) {
           if (service.service.packageName == packageName && 
               service.service.className == serviceClass.name) {
               Log.d("ServiceCheck", "서비스 실행 중: ${serviceClass.simpleName}")
               return true
           }
       }
       Log.d("ServiceCheck", "서비스 미실행: ${serviceClass.simpleName}")
       false
   } catch (e: SecurityException) {
       Log.e("ServiceCheck", "권한 오류: ${e.message}")
       // SharedPreferences나 파일로 상태 체크 구현 필요
       false
   }
}   
}