package com.eyetoai

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.eyetoai.control.AppControlPackage
import com.eyetoai.UsageModule // 추가
import com.swmansion.gesturehandler.RNGestureHandlerPackage
import com.facebook.react.PackageList
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions

class MainApplication : Application(), ReactApplication {
    override val reactNativeHost: ReactNativeHost = object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> = mutableListOf<ReactPackage>().apply {
     add(AppControlPackage())
            add(UsageModulePackage()) // UsageModulePackage 등록
            addAll(PackageList(this@MainApplication).packages) // 자동 생성된 패키지 추가
        }
        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override fun getJSMainModuleName(): String = "index"
    }

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)

        // Firebase 초기화
        if (FirebaseApp.getApps(this).isEmpty()) {
            FirebaseApp.initializeApp(this, FirebaseOptions.Builder()
                .setApiKey("AIzaSyAEkJGdvEOCHceuGTiAKWbB_-KepA-RWZo")
                .setApplicationId("1:598185887142:android:d5e9a9b3ed2d14caf9fb67")
                .setProjectId("eyetoai")
                .setStorageBucket("eyetoai.appspot.com")
                .build()
            )
        }
    }
}
