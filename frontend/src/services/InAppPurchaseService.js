/**
 * In-App Purchase Service for iOS App Store
 * Using cordova-plugin-purchase for Apple IAP integration
 */

class InAppPurchaseService {
  constructor() {
    this.products = [];
    this.isReady = false;
    this.store = null;
  }

  // Product IDs - These must match what you configure in App Store Connect
  static PRODUCTS = {
    PROGRAMME_RAMADAN: 'com.beautyfit.amel.programme.ramadan',
    PROGRAMME_MARCHE: 'com.beautyfit.amel.programme.marche',
    SUBSCRIPTION_MONTHLY: 'com.beautyfit.amel.subscription.monthly',
    SUBSCRIPTION_YEARLY: 'com.beautyfit.amel.subscription.yearly'
  };

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
      
      // Set up logging
      this.store.verbosity = window.CdvPurchase.LogLevel.DEBUG;

      // Register products
      this.store.register([
        {
          id: InAppPurchaseService.PRODUCTS.PROGRAMME_RAMADAN,
          type: window.CdvPurchase.ProductType.NON_CONSUMABLE,
          platform: window.CdvPurchase.Platform.APPLE_APPSTORE
        },
        {
          id: InAppPurchaseService.PRODUCTS.PROGRAMME_MARCHE,
          type: window.CdvPurchase.ProductType.NON_CONSUMABLE,
          platform: window.CdvPurchase.Platform.APPLE_APPSTORE
        },
        {
          id: InAppPurchaseService.PRODUCTS.SUBSCRIPTION_MONTHLY,
          type: window.CdvPurchase.ProductType.PAID_SUBSCRIPTION,
          platform: window.CdvPurchase.Platform.APPLE_APPSTORE
        },
        {
          id: InAppPurchaseService.PRODUCTS.SUBSCRIPTION_YEARLY,
          type: window.CdvPurchase.ProductType.PAID_SUBSCRIPTION,
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
        title: 'Programme Ramadan',
        description: 'Programme de 4 semaines pour le Ramadan',
        price: '9,99 €',
        priceValue: 9.99,
        currency: 'EUR',
        owned: false
      },
      {
        id: InAppPurchaseService.PRODUCTS.PROGRAMME_MARCHE,
        title: 'Programme Marche Poussette',
        description: 'Programme post-partum de 9 mois',
        price: '19,99 €',
        priceValue: 19.99,
        currency: 'EUR',
        owned: false
      },
      {
        id: InAppPurchaseService.PRODUCTS.SUBSCRIPTION_MONTHLY,
        title: 'Abonnement Mensuel',
        description: 'Accès illimité à tous les programmes',
        price: '4,99 €/mois',
        priceValue: 4.99,
        currency: 'EUR',
        owned: false
      },
      {
        id: InAppPurchaseService.PRODUCTS.SUBSCRIPTION_YEARLY,
        title: 'Abonnement Annuel',
        description: 'Accès illimité - Économisez 40%',
        price: '35,99 €/an',
        priceValue: 35.99,
        currency: 'EUR',
        owned: false
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
    if (!this.store) {
      // Mock purchase for web
      console.log('IAP: Mock purchase for', productId);
      const product = this.products.find(p => p.id === productId);
      if (product) {
        product.owned = true;
        return { success: true, product };
      }
      return { success: false, error: 'Product not found' };
    }

    try {
      const product = this.store.get(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const offer = product.getOffer();
      if (!offer) {
        throw new Error('No offer available');
      }

      const result = await this.store.order(offer);
      return { success: true, result };
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
      return { success: true, restored: [] };
    }

    try {
      await this.store.restorePurchases();
      return { success: true };
    } catch (error) {
      console.error('IAP: Restore failed', error);
      return { success: false, error: error.message };
    }
  }

  // Event handlers
  onProductUpdated(product) {
    console.log('IAP: Product updated', product.id);
  }

  onApproved(transaction) {
    console.log('IAP: Transaction approved', transaction.transactionId);
    transaction.verify();
  }

  onVerified(receipt) {
    console.log('IAP: Receipt verified');
    receipt.finish();
  }

  onFinished(transaction) {
    console.log('IAP: Transaction finished', transaction.transactionId);
  }

  onError(error) {
    console.error('IAP: Error', error);
  }
}

// Singleton instance
const iapService = new InAppPurchaseService();

export default iapService;
export { InAppPurchaseService };
