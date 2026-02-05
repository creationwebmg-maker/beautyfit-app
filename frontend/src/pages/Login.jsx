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
  const { login, loginWithGoogle, loginAsGuest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    loginWithGoogle();
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

          {/* Google Login Button */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full h-12 rounded-full mb-4 flex items-center justify-center gap-3"
            style={{ background: 'white', border: '2px solid #D2DDE7', color: '#333' }}
            data-testid="google-login-btn"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuer avec Google
              </>
            )}
          </Button>

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
