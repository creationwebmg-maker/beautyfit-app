/**
 * Platform Detection and Configuration
 * Detects whether the app is running in native iOS/Android or web browser
 */

class PlatformService {
  constructor() {
    this.isNative = false;
    this.platform = 'web';
    this.initialized = false;
  }

  /**
   * Initialize platform detection
   */
  async initialize() {
    if (this.initialized) return;

    // Check for Capacitor
    if (typeof window !== 'undefined' && window.Capacitor) {
      this.isNative = window.Capacitor.isNativePlatform();
      this.platform = window.Capacitor.getPlatform(); // 'ios', 'android', or 'web'
    }

    // Fallback detection using user agent
    if (!this.isNative) {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      
      // Check if running in standalone mode (added to home screen)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone === true;
      
      if (isStandalone) {
        // Detect platform from user agent when in standalone mode
        if (/iPhone|iPad|iPod/.test(userAgent)) {
          this.platform = 'ios-pwa';
        } else if (/android/i.test(userAgent)) {
          this.platform = 'android-pwa';
        }
      }
    }

    this.initialized = true;
    console.log(`Platform detected: ${this.platform}, isNative: ${this.isNative}`);
    return this;
  }

  /**
   * Check if running on iOS (native or PWA)
   */
  isIOS() {
    return this.platform === 'ios' || this.platform === 'ios-pwa' ||
           /iPhone|iPad|iPod/.test(navigator.userAgent);
  }

  /**
   * Check if running on Android (native or PWA)
   */
  isAndroid() {
    return this.platform === 'android' || this.platform === 'android-pwa' ||
           /android/i.test(navigator.userAgent);
  }

  /**
   * Check if running in native app container
   */
  isNativeApp() {
    return this.isNative;
  }

  /**
   * Check if running in web browser
   */
  isWeb() {
    return !this.isNative && !this.platform.includes('pwa');
  }

  /**
   * Get the appropriate payment method for the platform
   * - Native iOS: Use Apple In-App Purchases
   * - Web: Use Stripe
   */
  getPaymentMethod() {
    if (this.isNative && this.platform === 'ios') {
      return 'apple_iap';
    }
    if (this.isNative && this.platform === 'android') {
      return 'google_play';
    }
    return 'stripe';
  }

  /**
   * Check if Stripe payments should be used
   */
  useStripe() {
    return this.getPaymentMethod() === 'stripe';
  }

  /**
   * Check if Apple In-App Purchases should be used
   */
  useAppleIAP() {
    return this.getPaymentMethod() === 'apple_iap';
  }

  /**
   * Get platform info for debugging
   */
  getInfo() {
    return {
      platform: this.platform,
      isNative: this.isNative,
      isIOS: this.isIOS(),
      isAndroid: this.isAndroid(),
      isWeb: this.isWeb(),
      paymentMethod: this.getPaymentMethod(),
      userAgent: navigator.userAgent,
    };
  }
}

// Singleton instance
const platformService = new PlatformService();

export default platformService;
export { PlatformService };
