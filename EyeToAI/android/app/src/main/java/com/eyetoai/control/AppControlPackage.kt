package com.eyetoai.control

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.eyetoai.control.AppControlModule  // 경로 수정
import com.eyetoai.AppRestrictionModule
import com.eyetoai.UsageStatsModule

class AppControlPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> = listOf(
        AppControlModule(reactContext),
        AppRestrictionModule(reactContext),
        UsageStatsModule(reactContext)
    )

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}