import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/utils";
import { toast } from "sonner";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const [status, setStatus] = useState("loading");
  const [courseId, setCourseId] = useState(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId && token) {
      pollPaymentStatus(sessionId);
    }
  }, [searchParams, token]);

  const pollPaymentStatus = async (sessionId) => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setStatus("timeout");
      return;
    }

    try {
      const response = await api.get(`/payments/stripe/status/${sessionId}`, token);
      
      if (response.payment_status === "paid") {
        setStatus("success");
        setCourseId(response.course_id);
        toast.success("Paiement réussi ! Tu as maintenant accès au cours 🎉");
        return;
      } else if (response.status === "expired") {
        setStatus("expired");
        return;
      }

      setAttempts((prev) => prev + 1);
      setTimeout(() => pollPaymentStatus(sessionId), pollInterval);
    } catch (error) {
      console.error("Error checking payment status:", error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card p-8 rounded-2xl border border-border/50 shadow-lg max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <div className="w-20 h-20 rounded-full bg-accent/30 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-foreground animate-spin" />
            </div>
            <h1 
              className="text-2xl font-bold text-foreground mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Vérification du paiement...
            </h1>
            <p className="text-muted-foreground">
              Nous confirmons ton paiement, un instant...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 
              className="text-2xl font-bold text-foreground mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
              data-testid="payment-success-title"
            >
              Paiement réussi !
            </h1>
            <p className="text-muted-foreground mb-6">
              Merci pour ton achat ! Le programme Ramadan Marche est maintenant débloqué.
            </p>
            <div className="space-y-3">
              {courseId === "prog_ramadan" ? (
                <>
                  <Button
                    onClick={() => navigate("/programme/ramadan")}
                    className="w-full h-12 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}
                    data-testid="go-programme-btn"
                  >
                    Accéder au programme
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/account?tab=purchases")}
                    className="w-full h-12 rounded-full"
                    style={{ borderColor: '#D5A0A8', color: '#D5A0A8' }}
                    data-testid="go-purchases-btn"
                  >
                    Voir mes achats
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => navigate("/account?tab=purchases")}
                    className="w-full h-12 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}
                    data-testid="go-purchases-btn"
                  >
                    Voir mes achats
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    className="w-full h-12 rounded-full"
                    data-testid="go-dashboard-btn"
                  >
                    Retour au tableau de bord
                  </Button>
                </>
              )}
            </div>
          </>
        )}

        {(status === "error" || status === "expired" || status === "timeout") && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 
              className="text-2xl font-bold text-foreground mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {status === "timeout" ? "Délai dépassé" : "Erreur de paiement"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {status === "timeout" 
                ? "La vérification prend plus de temps que prévu. Vérifie ton email pour la confirmation."
                : "Une erreur est survenue. Si tu as été débité, contacte notre support."}
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/courses")}
                className="w-full h-12 rounded-full bg-foreground text-background"
              >
                Retourner aux cours
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/settings")}
                className="w-full h-12 rounded-full"
              >
                Contacter le support
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
