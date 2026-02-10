/**
 * Apple Sign In Service
 * Handles Sign in with Apple authentication for iOS
 */

import platformService from './PlatformService';

class AppleSignInService {
  constructor() {
    this.initialized = false;
  }

  /**
   * Check if Sign in with Apple is available
   */
  isAvailable() {
    // Sign in with Apple is available on iOS 13+
    return platformService.isIOS() || platformService.isNativeApp();
  }

  /**
   * Perform Sign in with Apple using native API
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async signIn() {
    try {
      // Check if we're in a Capacitor environment
      if (window.Capacitor && window.Capacitor.Plugins) {
        // Use native Sign in with Apple if available
        const { SignInWithApple } = window.Capacitor.Plugins;
        
        if (SignInWithApple) {
          const result = await SignInWithApple.authorize({
            clientId: 'com.beautyfit.amel',
            redirectURI: window.location.origin + '/auth/apple/callback',
            scopes: 'email name'
          });
          
          if (result.response) {
            return {
              success: true,
              data: {
                identityToken: result.response.identityToken,
                authorizationCode: result.response.authorizationCode,
                user: result.response.user,
                email: result.response.email,
                givenName: result.response.givenName,
                familyName: result.response.familyName
              }
            };
          }
        }
      }
      
      return {
        success: false,
        error: 'Sign in with Apple not available'
      };
    } catch (error) {
      console.error('Apple Sign In error:', error);
      
      // Handle user cancellation
      if (error.message?.includes('cancel') || error.code === 1001) {
        return {
          success: false,
          error: 'cancelled'
        };
      }

      return {
        success: false,
        error: error.message || 'Apple Sign In failed'
      };
    }
  }
}

const appleSignInService = new AppleSignInService();
export default appleSignInService;
