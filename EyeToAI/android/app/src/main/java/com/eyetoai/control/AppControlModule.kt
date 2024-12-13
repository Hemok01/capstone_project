// AppControlModule.kt
package com.eyetoai.control

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AppControlModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "AppControl"
    
    @ReactMethod
    fun restrictApp(packageName: String) {
        val intent = Intent(reactApplicationContext, Class.forName("com.eyetoai.services.AppMonitorService")).apply {
            action = "com.eyetoai.RESTRICT_APP"
            putExtra("packageName", packageName)
        }
        reactApplicationContext.startService(intent)
    }
}