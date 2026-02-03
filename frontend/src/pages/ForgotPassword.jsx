import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Email envoyé ! Vérifie ta boîte de réception.");
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/login")}
          className="mb-6 hover:bg-secondary"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        {/* Card */}
        <div className="bg-card p-8 rounded-2xl border border-border/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          {!sent ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-accent/30 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-foreground" />
                </div>
                <h1 
                  className="text-2xl font-bold text-foreground mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  data-testid="forgot-password-title"
                >
                  Mot de passe oublié ?
                </h1>
                <p className="text-muted-foreground">
                  Entre ton email et nous t'enverrons un lien pour réinitialiser ton mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ton@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                    data-testid="email-input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-full bg-foreground text-background hover:bg-foreground/90"
                  data-testid="submit-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    "Envoyer le lien"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h1 
                className="text-2xl font-bold text-foreground mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Email envoyé !
              </h1>
              <p className="text-muted-foreground mb-6">
                Vérifie ta boîte de réception et suis les instructions pour réinitialiser ton mot de passe.
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="rounded-full bg-foreground text-background"
                data-testid="back-to-login-btn"
              >
                Retour à la connexion
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Tu te souviens ?{" "}
              <Link 
                to="/login" 
                className="text-foreground font-medium hover:underline"
              >
                Connecte-toi
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
