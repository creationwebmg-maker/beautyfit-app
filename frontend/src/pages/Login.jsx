import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft, Loader2, User } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login, loginAsGuest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password, rememberMe);
      toast.success("Connexion réussie !");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    toast.success("Bienvenue en mode invité !");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F7F5F2' }}>
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1761971975973-cbb3e59263de?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZ3ltJTIwaW50ZXJpb3IlMjBiZWlnZSUyMGFlc3RoZXRpY3xlbnwwfHx8fDE3NzAxMDA0Mzd8MA&ixlib=rb-4.1.0&q=85')] bg-cover bg-center opacity-10" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 hover:bg-[#D5A0A8]/20"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-2xl border shadow-lg" style={{ borderColor: '#D2DDE7' }}>
          <div className="text-center mb-8">
            <img 
              src="https://customer-assets.emergentagent.com/job_d0f789bc-27a2-4e1a-8509-4380495dce2a/artifacts/bxz4jtgp_BEAUTYFIT.png" 
              alt="Beautyfit" 
              className="h-16 w-16 mx-auto mb-4 object-contain"
            />
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: "'Playfair Display', serif", color: '#333' }}
              data-testid="login-title"
            >
              Bon retour !
            </h1>
            <p style={{ color: '#666' }}>
              Connecte-toi pour accéder à tes programmes
            </p>
          </div>

          {/* Guest Mode Button */}
          <Button
            type="button"
            onClick={handleGuestLogin}
            variant="outline"
            className="w-full h-12 rounded-full mb-6 flex items-center justify-center gap-2"
            style={{ borderColor: '#D5A0A8', color: '#D5A0A8' }}
            data-testid="guest-login-btn"
          >
            <User className="w-5 h-5" />
            Continuer en mode invité
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: '#D2DDE7' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white" style={{ color: '#999' }}>ou avec email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: '#333' }}>Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ton@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-12 rounded-xl"
                style={{ borderColor: '#D2DDE7' }}
                data-testid="email-input"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" style={{ color: '#333' }}>Mot de passe</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm transition-colors"
                  style={{ color: '#D5A0A8' }}
                  data-testid="forgot-password-link"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-12 rounded-xl pr-10"
                  style={{ borderColor: '#D2DDE7' }}
                  data-testid="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#999' }}
                  data-testid="toggle-password-btn"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked)}
                className="border-[#D5A0A8] data-[state=checked]:bg-[#E37E7F] data-[state=checked]:border-[#E37E7F]"
                data-testid="remember-me-checkbox"
              />
              <Label 
                htmlFor="remember-me" 
                className="text-sm cursor-pointer"
                style={{ color: '#666' }}
              >
                Rester connectée
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full"
              style={{ background: '#E37E7F' }}
              data-testid="login-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p style={{ color: '#666' }}>
              Pas encore de compte ?{" "}
              <Link 
                to="/register" 
                className="font-medium hover:underline"
                style={{ color: '#E37E7F' }}
                data-testid="register-link"
              >
                Inscris-toi
              </Link>
            </p>

            {/* Legal Links */}
            <div className="flex justify-center gap-4 mt-4 text-xs" style={{ color: '#999' }}>
              <Link to="/confidentialite" className="hover:underline">
                Confidentialité
              </Link>
              <span>•</span>
              <Link to="/conditions-generales" className="hover:underline">
                CGU
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
