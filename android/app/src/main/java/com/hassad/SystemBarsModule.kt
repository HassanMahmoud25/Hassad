package com.hassad

import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.ViewManager

/**
 * The app draws edge to edge (see MainActivity); this only chooses dark or
 * light system-bar icons so they stay legible on Paper and on Night.
 */
class SystemBarsModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName() = "HassadSystemBars"

  @ReactMethod
  fun setDarkContent(dark: Boolean) {
    val activity = reactApplicationContext.currentActivity ?: return
    UiThreadUtil.runOnUiThread {
      val controller = WindowInsetsControllerCompat(activity.window, activity.window.decorView)
      controller.isAppearanceLightStatusBars = dark
      controller.isAppearanceLightNavigationBars = dark
    }
  }
}

class SystemBarsPackage : ReactPackage {
  override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> =
      listOf(SystemBarsModule(context))

  override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> =
      emptyList()
}
