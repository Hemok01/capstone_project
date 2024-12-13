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

if (FirebaseApp.getApps(this).isEmpty()) {
    FirebaseOptions options = new FirebaseOptions.Builder()
            .setApiKey(BuildConfig.FIREBASE_API_KEY)
            .setApplicationId(BuildConfig.FIREBASE_APP_ID)
            .setProjectId(BuildConfig.FIREBASE_PROJECT_ID)
            .setStorageBucket(BuildConfig.FIREBASE_STORAGE_BUCKET)
            .build();
    FirebaseApp.initializeApp(this, options);
}
    }
}
