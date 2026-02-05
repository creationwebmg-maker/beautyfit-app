import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/utils";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  CreditCard, 
  Lock, 
  Check,
  Moon,
  Timer,
  Footprints,
  Loader2,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import BottomNavBar from "@/components/BottomNavBar";
import platformService from "@/services/PlatformService";
import iapService from "@/services/InAppPurchaseService";

const ProgrammeCheckout = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated, isGuest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [platformReady, setPlatformReady] = useState(false);

  const programme = {
    id: "prog_ramadan",
    title: "Programme Ramadan Marche",
    subtitle: "ALLER BIEN, MÊME À JEUN",
    price: 22.00,
    iapProductId: "com.beautyfit.amel.programme.ramadan",
    features: [
      "4 semaines de programme complet",
      "30 minutes par séance",
      "2-3 séances par semaine",
      "Compteur de pas automatique",
      "Feedback vibration/son",
      "Adapté au jeûne",
      "Accès illimité à vie"
    ]
  };

  // Initialize platform detection
  useEffect(() => {
    const initPlatform = async () => {
      await platformService.initialize();
      setPaymentMethod(platformService.getPaymentMethod());
      
      // Initialize IAP if on native iOS
      if (platformService.useAppleIAP()) {
        await iapService.initialize();
      }
      
      setPlatformReady(true);
    };
    initPlatform();
  }, []);

  const handleCheckout = async () => {
    if (!isAuthenticated || isGuest) {
      toast.error("Connectez-vous pour acheter");
      navigate("/login");
      return;
    }

    setLoading(true);
    
    try {
      // Use Apple IAP on native iOS
      if (paymentMethod === "apple_iap") {
        const result = await iapService.purchase(programme.iapProductId);
        if (result.success) {
          toast.success("Achat réussi ! 🎉");
          navigate("/account?tab=purchases");
        } else {
          toast.error(result.error || "Erreur lors de l'achat");
        }
        setLoading(false);
        return;
      }

      // Use Stripe on web
      const response = await api.post("/payments/stripe/checkout", {
        course_id: programme.id,
        origin_url: window.location.origin
      }, token);

      if (response.checkout_url) {
        window.location.href = response.checkout_url;
      } else {
        toast.error("Erreur lors de la création du paiement");
      }
    } catch (error) {
      toast.error(error.message || "Erreur lors du paiement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F7F5F2' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b" style={{ background: '#F7F5F2', borderColor: '#D2DDE7' }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
              Finaliser l'achat
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Programme Summary */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="p-6" style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm">PROGRAMME</p>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {programme.title}
                </h2>
              </div>
            </div>
            <p className="text-white/90">{programme.subtitle}</p>
          </div>
          
          <CardContent className="p-6" style={{ background: 'white' }}>
            {/* Features */}
            <h3 className="font-semibold mb-4" style={{ color: '#333' }}>Ce qui est inclus :</h3>
            <ul className="space-y-3 mb-6">
              {programme.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#E37E7F' }}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span style={{ color: '#333' }}>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Price */}
            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#F7F5F2' }}>
              <span className="font-medium" style={{ color: '#666' }}>Total</span>
              <span className="text-3xl font-bold" style={{ color: '#E37E7F' }}>
                {programme.price.toFixed(2)} €
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border-0 shadow-md" style={{ background: 'white' }}>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#333' }}>
              <CreditCard className="w-5 h-5" style={{ color: '#E37E7F' }} />
              Modes de paiement acceptés
            </h3>
            
            {/* Carte bancaire */}
            <div className="p-4 rounded-xl border-2 mb-3" style={{ borderColor: '#E37E7F', background: '#FEF7F7' }}>
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-10 h-7 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">VISA</span>
                  </div>
                  <div className="w-10 h-7 rounded bg-gradient-to-r from-red-500 to-yellow-500 flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">MC</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm" style={{ color: '#333' }}>Carte bancaire</p>
                  <p className="text-xs" style={{ color: '#666' }}>Visa, Mastercard, CB</p>
                </div>
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#E37E7F' }}>
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            {/* Apple Pay / Google Pay via Link */}
            <div className="p-4 rounded-xl border-2 mb-4" style={{ borderColor: '#E5E5E5', background: 'white' }}>
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-10 h-7 rounded bg-black flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold"> Pay</span>
                  </div>
                  <div className="w-10 h-7 rounded bg-white border flex items-center justify-center">
                    <span className="text-[10px] font-bold">G Pay</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm" style={{ color: '#333' }}>Apple Pay / Google Pay</p>
                  <p className="text-xs" style={{ color: '#666' }}>Paiement rapide et sécurisé</p>
                </div>
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#E37E7F' }}>
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F0FDF4' }}>
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700">
                Paiement 100% sécurisé par Stripe
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Not Authenticated Message */}
        {(!isAuthenticated || isGuest) && (
          <Card className="border-0 shadow-md" style={{ background: '#FEF3C7' }}>
            <CardContent className="p-4">
              <p className="text-sm text-amber-800">
                ⚠️ Vous devez être connectée pour effectuer un achat.
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="mt-3 rounded-full"
                size="sm"
                style={{ background: '#E37E7F' }}
              >
                Se connecter
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pay Button */}
        <Button
          onClick={handleCheckout}
          disabled={loading || !isAuthenticated || isGuest}
          className="w-full h-14 rounded-full text-lg font-semibold"
          style={{ 
            background: isAuthenticated && !isGuest 
              ? 'linear-gradient(135deg, #E37E7F, #EE9F80)' 
              : '#ccc' 
          }}
          data-testid="pay-button"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Lock className="w-5 h-5 mr-2" />
              Payer {programme.price.toFixed(2)} €
            </>
          )}
        </Button>

        {/* Terms */}
        <p className="text-center text-xs" style={{ color: '#999' }}>
          En cliquant sur "Payer", vous acceptez nos{" "}
          <a href="/terms" className="underline">conditions générales</a>
          {" "}et notre{" "}
          <a href="/privacy" className="underline">politique de confidentialité</a>.
        </p>
      </main>

      <BottomNavBar />
    </div>
  );
};

export default ProgrammeCheckout;
