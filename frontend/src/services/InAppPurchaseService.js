/**
 * In-App Purchase Service for iOS App Store
 * Using cordova-plugin-purchase for Apple IAP integration
 * 
 * NOTE: Ce service gère les achats in-app Apple pour iOS natif.
 * Sur le web, utilisez Stripe via ProgrammeCheckout.jsx
 */

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

class InAppPurchaseService {
  constructor() {
    this.products = [];
    this.isReady = false;
    this.store = null;
    this.authToken = null;
    this.purchaseCallbacks = {};
  }

  // Product IDs - Must match App Store Connect configuration
  static PRODUCTS = {
    PROGRAMME_RAMADAN: 'com.beautyfit.amel.programme.ramadan'
  };

  /**
   * Set authentication token for backend verification
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Initialize the store
   */
  async initialize() {
    // Check if running in Capacitor/Cordova environment
    if (typeof window.CdvPurchase === 'undefined') {
      console.log('IAP: Not in native environment, using mock store');
      this.isReady = true;
      return this.initMockStore();
    }

    try {
      this.store = window.CdvPurchase.store;
      
      // Set up logging (reduce verbosity in production)
      this.store.verbosity = process.env.NODE_ENV === 'development' 
        ? window.CdvPurchase.LogLevel.DEBUG 
        : window.CdvPurchase.LogLevel.WARNING;

      // Register products
      this.store.register([
        {
          id: InAppPurchaseService.PRODUCTS.PROGRAMME_RAMADAN,
          type: window.CdvPurchase.ProductType.NON_CONSUMABLE,
          platform: window.CdvPurchase.Platform.APPLE_APPSTORE
        }
      ]);

      // Set up event handlers
      this.store.when()
        .productUpdated(product => this.onProductUpdated(product))
        .approved(transaction => this.onApproved(transaction))
        .verified(receipt => this.onVerified(receipt))
        .finished(transaction => this.onFinished(transaction))
        .error(error => this.onError(error));

      // Initialize the store
      await this.store.initialize([window.CdvPurchase.Platform.APPLE_APPSTORE]);
      
      this.isReady = true;
      console.log('IAP: Store initialized successfully');
      
      return true;
    } catch (error) {
      console.error('IAP: Failed to initialize store', error);
      return false;
    }
  }

  /**
   * Mock store for web development
   */
  initMockStore() {
    this.products = [
      {
        id: InAppPurchaseService.PRODUCTS.PROGRAMME_RAMADAN,
        title: 'Programme Ramadan Marche',
        description: 'Programme de 4 semaines pour le Ramadan',
        price: '22,00 €',
        priceValue: 22.00,
        currency: 'EUR',
        owned: false,
        canPurchase: true
      }
    ];
    return true;
  }

  /**
   * Get all available products
   */
  getProducts() {
    if (!this.store) {
      return this.products;
    }
    return this.store.products;
  }

  /**
   * Get a specific product
   */
  getProduct(productId) {
    if (!this.store) {
      return this.products.find(p => p.id === productId);
    }
    return this.store.get(productId);
  }

  /**
   * Check if a product is owned
   */
  isOwned(productId) {
    const product = this.getProduct(productId);
    if (!product) return false;
    
    if (!this.store) {
      return product.owned || false;
    }
    return product.owned;
  }

  /**
   * Purchase a product
   */
  async purchase(productId) {
    // Mock purchase for web testing
    if (!this.store) {
      console.log('IAP: Mock purchase for', productId);
      return new Promise((resolve) => {
        // Simulate a mock purchase that calls the backend
        setTimeout(async () => {
          try {
            // Send mock transaction to backend
            const response = await fetch(`${API_URL}/api/purchases/apple/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.authToken}`
              },
              body: JSON.stringify({
                transaction_id: `mock_${Date.now()}`,
                product_id: productId,
                receipt_data: 'mock_receipt_data'
              })
            });

            if (response.ok) {
              const product = this.products.find(p => p.id === productId);
              if (product) product.owned = true;
              resolve({ success: true, product });
            } else {
              const error = await response.json();
              resolve({ success: false, error: error.detail || 'Purchase verification failed' });
            }
          } catch (err) {
            resolve({ success: false, error: err.message });
          }
        }, 1000);
      });
    }

    try {
      const product = this.store.get(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      if (!product.canPurchase) {
        // Product might already be owned
        if (product.owned) {
          return { success: true, product, alreadyOwned: true };
        }
        throw new Error('Product cannot be purchased');
      }

      const offer = product.getOffer();
      if (!offer) {
        throw new Error('No offer available');
      }

      // Create a promise to track the purchase result
      return new Promise((resolve, reject) => {
        this.purchaseCallbacks[productId] = { resolve, reject };
        
        // Initiate the purchase
        this.store.order(offer).catch((error) => {
          delete this.purchaseCallbacks[productId];
          if (error && error.code === window.CdvPurchase.ErrorCode.PAYMENT_CANCELLED) {
            resolve({ success: false, cancelled: true, error: 'Achat annulé' });
          } else {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('IAP: Purchase failed', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases() {
    if (!this.store) {
      console.log('IAP: Mock restore purchases');
      // Call backend to check for existing purchases
      try {
        const response = await fetch(`${API_URL}/api/purchases/apple/restore`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          return { success: true, restored: data.restored_products || [] };
        }
        return { success: false, error: 'Restore failed' };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    try {
      await this.store.restorePurchases();
      return { success: true };
    } catch (error) {
      console.error('IAP: Restore failed', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify transaction with backend
   */
  async verifyWithBackend(transaction) {
    try {
      const response = await fetch(`${API_URL}/api/purchases/apple/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          transaction_id: transaction.transactionId || transaction.id,
          product_id: transaction.productId || transaction.products?.[0]?.id,
          receipt_data: transaction.appStoreReceipt || ''
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('IAP: Backend verification failed', error);
      throw error;
    }
  }

  // Event handlers
  onProductUpdated(product) {
    console.log('IAP: Product updated', product.id, product);
  }

  async onApproved(transaction) {
    console.log('IAP: Transaction approved', transaction.transactionId);
    
    try {
      // Verify with backend before finishing
      await this.verifyWithBackend(transaction);
      
      // Mark as verified in the store
      transaction.verify();
    } catch (error) {
      console.error('IAP: Backend verification failed', error);
      // Resolve the purchase promise with error
      const productId = transaction.productId || transaction.products?.[0]?.id;
      if (this.purchaseCallbacks[productId]) {
        this.purchaseCallbacks[productId].resolve({
          success: false,
          error: error.message
        });
        delete this.purchaseCallbacks[productId];
      }
    }
  }

  onVerified(receipt) {
    console.log('IAP: Receipt verified');
    receipt.finish();
  }

  onFinished(transaction) {
    console.log('IAP: Transaction finished', transaction.transactionId);
    
    // Resolve the purchase promise
    const productId = transaction.productId || transaction.products?.[0]?.id;
    if (this.purchaseCallbacks[productId]) {
      this.purchaseCallbacks[productId].resolve({
        success: true,
        transaction
      });
      delete this.purchaseCallbacks[productId];
    }
  }

  onError(error) {
    console.error('IAP: Error', error);
    
    // Try to resolve any pending purchase with the error
    Object.keys(this.purchaseCallbacks).forEach(productId => {
      this.purchaseCallbacks[productId].resolve({
        success: false,
        error: error.message || 'Purchase error'
      });
      delete this.purchaseCallbacks[productId];
    });
  }
}

// Singleton instance
const iapService = new InAppPurchaseService();

export default iapService;
export { InAppPurchaseService };
