/**
 * Apple Sign In Service
 * Handles Sign in with Apple authentication for iOS
 */

import { SignInWithApple } from '@capacitor-community/apple-sign-in';
import platformService from './PlatformService';

class AppleSignInService {
  constructor() {
    this.initialized = false;
  }

  /**
   * Check if Sign in with Apple is available
   */
  isAvailable() {
    // Sign in with Apple is available on iOS 13+ and web
    return platformService.isIOS() || platformService.isNativeApp();
  }

  /**
   * Perform Sign in with Apple
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async signIn() {
    try {
      const options = {
        clientId: 'com.beautyfit.amel',
        redirectURI: window.location.origin + '/auth/apple/callback',
        scopes: 'email name',
        state: this.generateState(),
        nonce: this.generateNonce()
      };

      const result = await SignInWithApple.authorize(options);
      
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

      return {
        success: false,
        error: 'No response from Apple Sign In'
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

  /**
   * Generate random state for CSRF protection
   */
  generateState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Generate random nonce for replay protection
   */
  generateNonce() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

const appleSignInService = new AppleSignInService();
export default appleSignInService;
