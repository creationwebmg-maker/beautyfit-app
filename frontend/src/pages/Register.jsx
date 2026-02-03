import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    email: "",
    password: "",
    fitness_goal: "",
  });

  const fitnessGoals = [
    { value: "weight_loss", label: "Perte de poids" },
    { value: "toning", label: "Tonification" },
    { value: "fitness", label: "Remise en forme" },
    { value: "muscle", label: "Prise de muscle" },
    { value: "flexibility", label: "Souplesse" },
    { value: "wellness", label: "Bien-être général" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoalChange = (value) => {
    setFormData({ ...formData, fitness_goal: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setLoading(true);
    try {
      await register(formData);
      toast.success("Inscription réussie ! Bienvenue chez Amel Fit Coach 🌸");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1761971975973-cbb3e59263de?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZ3ltJTIwaW50ZXJpb3IlMjBiZWlnZSUyMGFlc3RoZXRpY3xlbnwwfHx8fDE3NzAxMDA0Mzd8MA&ixlib=rb-4.1.0&q=85')] bg-cover bg-center opacity-10" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 hover:bg-secondary"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        {/* Register Card */}
        <div className="bg-card p-8 rounded-2xl border border-border/50 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="text-center mb-8">
            <h1 
              className="text-3xl font-bold text-foreground mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
              data-testid="register-title"
            >
              Rejoins-nous !
            </h1>
            <p className="text-muted-foreground">
              Crée ton compte pour commencer ton parcours fitness
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom</Label>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                placeholder="Ton prénom"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="h-12"
                data-testid="firstname-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ton@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-12"
                data-testid="email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 caractères"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-12 pr-10"
                  data-testid="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-testid="toggle-password-btn"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fitness_goal">Objectif sportif (optionnel)</Label>
              <Select value={formData.fitness_goal} onValueChange={handleGoalChange}>
                <SelectTrigger className="h-12" data-testid="fitness-goal-select">
                  <SelectValue placeholder="Choisis ton objectif" />
                </SelectTrigger>
                <SelectContent>
                  {fitnessGoals.map((goal) => (
                    <SelectItem key={goal.value} value={goal.value}>
                      {goal.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-foreground text-background hover:bg-foreground/90 mt-2"
              data-testid="register-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Inscription...
                </>
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Déjà un compte ?{" "}
              <Link 
                to="/login" 
                className="text-foreground font-medium hover:underline"
                data-testid="login-link"
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

export default Register;
