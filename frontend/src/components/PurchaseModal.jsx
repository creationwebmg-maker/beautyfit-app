import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Check, 
  Loader2, 
  Crown, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import iapService, { InAppPurchaseService } from "@/services/InAppPurchaseService";

const PurchaseModal = ({ isOpen, onClose, productId, onPurchaseComplete }) => {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (isOpen && productId) {
      const prod = iapService.getProduct(productId);
      setProduct(prod);
    }
  }, [isOpen, productId]);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const result = await iapService.purchase(productId);
      if (result.success) {
        toast.success("Achat réussi ! 🎉");
        onPurchaseComplete && onPurchaseComplete(productId);
        onClose();
      } else {
        toast.error(result.error || "Échec de l'achat");
      }
    } catch (error) {
      toast.error("Erreur lors de l'achat");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const result = await iapService.restorePurchases();
      if (result.success) {
        toast.success("Achats restaurés !");
        onClose();
      } else {
        toast.error("Aucun achat à restaurer");
      }
    } catch (error) {
      toast.error("Erreur lors de la restauration");
    } finally {
      setRestoring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md border-0 shadow-2xl" style={{ background: '#F7F5F2' }}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}>
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
              {product?.title || "Programme Premium"}
            </h2>
            <p className="text-sm mt-2" style={{ color: '#666' }}>
              {product?.description || "Accède à tout le contenu"}
            </p>
          </div>

          {/* Price */}
          <div className="text-center mb-6 p-4 rounded-xl" style={{ background: 'white' }}>
            <span className="text-3xl font-bold" style={{ color: '#E37E7F' }}>
              {product?.price || "9,99 €"}
            </span>
            <p className="text-xs mt-1" style={{ color: '#999' }}>
              Paiement unique • Accès à vie
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {[
              "Accès illimité au programme",
              "Timer et vibrations guidées",
              "Compteur de pas automatique",
              "Mises à jour gratuites"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#D5A0A8' }}>
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm" style={{ color: '#333' }}>{feature}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full h-12 rounded-full text-white font-semibold"
              style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Acheter maintenant
                </>
              )}
            </Button>

            <Button
              onClick={handleRestore}
              disabled={restoring}
              variant="outline"
              className="w-full h-10 rounded-full"
              style={{ borderColor: '#D5A0A8', color: '#D5A0A8' }}
            >
              {restoring ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Restauration...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restaurer mes achats
                </>
              )}
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full h-10"
              style={{ color: '#999' }}
            >
              Annuler
            </Button>
          </div>

          {/* Legal */}
          <p className="text-xs text-center mt-4" style={{ color: '#999' }}>
            Le paiement sera débité sur votre compte Apple ID. 
            En achetant, vous acceptez nos{" "}
            <a href="/conditions-generales" className="underline">CGV</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseModal;
