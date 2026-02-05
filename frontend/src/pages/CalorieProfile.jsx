import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/utils";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  ChevronRight,
  User,
  Target,
  Activity,
  Moon,
  Utensils,
  Droplet,
  BedDouble,
  Heart,
  Loader2,
  Check,
  Flame
} from "lucide-react";
import BottomNavBar from "@/components/BottomNavBar";

const CalorieProfile = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated, isGuest } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  
  const [profile, setProfile] = useState({
    age: "",
    height: "",
    current_weight: "",
    target_weight: "",
    gender: "femme",
    activity_level: "",
    goal: "",
    does_suhoor: "",
    meals_count: "",
    eating_habits: [],
    hydration: "",
    sleep_hours: "",
    ramadan_feelings: []
  });

  const totalSteps = 6;

  const activityLevels = [
    { value: "sedentary", label: "Sédentaire", desc: "Peu de sport / pas du tout" },
    { value: "light", label: "Légèrement active", desc: "2–3x / semaine" },
    { value: "active", label: "Active", desc: "Sport ou marche 4–5x / semaine" },
    { value: "very_active", label: "Très active", desc: "Tous les jours" }
  ];

  const goals = [
    { value: "weight_loss", label: "Perte de poids", icon: "📉" },
    { value: "maintain", label: "Maintenir mon poids", icon: "⚖️" },
    { value: "muscle_gain", label: "Prise de masse", icon: "💪" },
    { value: "wellness", label: "Bien-être", icon: "🌸" }
  ];

  const suhoorOptions = [
    { value: "yes", label: "Oui" },
    { value: "sometimes", label: "Parfois" },
    { value: "no", label: "Non" }
  ];

  const eatingHabits = [
    "Je mange souvent frit pendant Ramadan",
    "Je consomme beaucoup de sucre",
    "Je grignote après l'iftar",
    "Je mange tard la nuit",
    "J'ai souvent des envies incontrôlées"
  ];

  const hydrationLevels = [
    { value: "less_1l", label: "< 1 L / nuit" },
    { value: "1_1.5l", label: "1 – 1,5 L" },
    { value: "1.5_2l", label: "1,5 – 2 L" },
    { value: "more_2l", label: "+ 2 L" }
  ];

  const sleepOptions = [
    { value: "less_5h", label: "< 5 h" },
    { value: "5_6h", label: "5 – 6 h" },
    { value: "6_7h", label: "6 – 7 h" },
    { value: "more_7h", label: "+ 7 h" }
  ];

  const ramadanFeelings = [
    "Fatigue intense",
    "Fringales",
    "Constipation",
    "Ballonnements",
    "Perte d'énergie en fin de journée",
    "Je me sens plutôt bien"
  ];

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field, item) => {
    setProfile(prev => {
      const arr = prev[field];
      if (arr.includes(item)) {
        return { ...prev, [field]: arr.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...arr, item] };
      }
    });
  };

  const canProceed = () => {
    switch(step) {
      case 1:
        return profile.age && profile.height && profile.current_weight && profile.target_weight;
      case 2:
        return profile.activity_level && profile.goal;
      case 3:
        return profile.does_suhoor && profile.meals_count;
      case 4:
        return true; // eating habits is optional
      case 5:
        return profile.hydration && profile.sleep_hours;
      case 6:
        return true; // feelings is optional
      default:
        return false;
    }
  };

  const calculateCalories = async () => {
    setCalculating(true);
    try {
      const response = await api.post("/calories/calculate-needs", profile, token);
      setResult(response);
      toast.success("Calcul terminé !");
    } catch (error) {
      toast.error(error.message || "Erreur lors du calcul");
    } finally {
      setCalculating(false);
    }
  };

  const saveAndContinue = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      await calculateCalories();
    }
  };

  // Not authenticated view
  if (!isAuthenticated || isGuest) {
    return (
      <div className="min-h-screen pb-24" style={{ background: '#F7F5F2' }}>
        <header className="sticky top-0 z-40 border-b" style={{ background: '#F7F5F2', borderColor: '#D2DDE7' }}>
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                Mon Profil Nutritionnel
              </h1>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card className="border-0 shadow-md" style={{ background: 'white' }}>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}>
                <Flame className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                Connectez-vous pour calculer vos besoins
              </h2>
              <p className="mb-6" style={{ color: '#666' }}>
                Créez un compte pour obtenir un calcul personnalisé de vos besoins caloriques.
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate("/register")} className="rounded-full" style={{ background: '#E37E7F' }}>
                  Créer mon compte
                </Button>
                <Button variant="outline" onClick={() => navigate("/login")} className="rounded-full" style={{ borderColor: '#D5A0A8', color: '#D5A0A8' }}>
                  J'ai déjà un compte
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <BottomNavBar />
      </div>
    );
  }

  // Result view
  if (result) {
    return (
      <div className="min-h-screen pb-24" style={{ background: '#F7F5F2' }}>
        <header className="sticky top-0 z-40" style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}>
          <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-white text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
              Tes besoins caloriques
            </h1>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {/* Main Calories */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}>
              <p className="text-white/80 mb-2">Objectif calorique journalier</p>
              <p className="text-5xl font-bold text-white">{result.daily_calories}</p>
              <p className="text-white text-xl">kcal / jour</p>
            </div>
            <CardContent className="p-6" style={{ background: 'white' }}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl" style={{ background: '#FEF2F2' }}>
                  <p className="text-2xl font-bold" style={{ color: '#E37E7F' }}>{result.proteins}g</p>
                  <p className="text-sm" style={{ color: '#666' }}>Protéines</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: '#FFF7ED' }}>
                  <p className="text-2xl font-bold" style={{ color: '#EE9F80' }}>{result.carbs}g</p>
                  <p className="text-sm" style={{ color: '#666' }}>Glucides</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: '#FDF2F8' }}>
                  <p className="text-2xl font-bold" style={{ color: '#D5A0A8' }}>{result.fats}g</p>
                  <p className="text-sm" style={{ color: '#666' }}>Lipides</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-0 shadow-md" style={{ background: 'white' }}>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                💡 Conseils personnalisés
              </h3>
              <div className="space-y-3">
                {result.recommendations?.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#F7F5F2' }}>
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#E37E7F' }} />
                    <p className="text-sm" style={{ color: '#333' }}>{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Meal Distribution */}
          {result.meal_distribution && (
            <Card className="border-0 shadow-md" style={{ background: 'white' }}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                  🍽️ Répartition des repas
                </h3>
                <div className="space-y-3">
                  {Object.entries(result.meal_distribution).map(([meal, cals]) => (
                    <div key={meal} className="flex justify-between items-center p-3 rounded-xl" style={{ background: '#F7F5F2' }}>
                      <span className="font-medium capitalize" style={{ color: '#333' }}>{meal}</span>
                      <span className="font-bold" style={{ color: '#E37E7F' }}>{cals} kcal</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => { setResult(null); setStep(1); }}
              className="flex-1 h-12 rounded-full"
              style={{ borderColor: '#D5A0A8', color: '#D5A0A8' }}
            >
              Refaire le calcul
            </Button>
            <Button 
              onClick={() => navigate("/calories")}
              className="flex-1 h-12 rounded-full"
              style={{ background: '#E37E7F' }}
            >
              Suivre mes repas
            </Button>
          </div>
        </main>
        <BottomNavBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F7F5F2' }} data-testid="calorie-profile-page">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b" style={{ background: '#F7F5F2', borderColor: '#D2DDE7' }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                Mon Profil Nutritionnel
              </h1>
              <p className="text-sm" style={{ color: '#666' }}>Étape {step} sur {totalSteps}</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: '#E5E5E5' }}>
            <div 
              className="h-full transition-all duration-300 rounded-full"
              style={{ 
                width: `${(step / totalSteps) * 100}%`,
                background: 'linear-gradient(135deg, #E37E7F, #EE9F80)'
              }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card className="border-0 shadow-md" style={{ background: 'white' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}>
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                    Informations de base
                  </h2>
                  <p className="text-sm" style={{ color: '#666' }}>Pour calculer tes besoins</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium" style={{ color: '#333' }}>Âge</Label>
                  <Input
                    type="number"
                    value={profile.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    placeholder="25"
                    className="mt-1 rounded-xl"
                    style={{ borderColor: '#D5A0A8' }}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium" style={{ color: '#333' }}>Taille (cm)</Label>
                  <Input
                    type="number"
                    value={profile.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                    placeholder="165"
                    className="mt-1 rounded-xl"
                    style={{ borderColor: '#D5A0A8' }}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium" style={{ color: '#333' }}>Poids actuel (kg)</Label>
                  <Input
                    type="number"
                    value={profile.current_weight}
                    onChange={(e) => handleInputChange("current_weight", e.target.value)}
                    placeholder="65"
                    className="mt-1 rounded-xl"
                    style={{ borderColor: '#D5A0A8' }}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium" style={{ color: '#333' }}>Poids souhaité (kg)</Label>
                  <Input
                    type="number"
                    value={profile.target_weight}
                    onChange={(e) => handleInputChange("target_weight", e.target.value)}
                    placeholder="58"
                    className="mt-1 rounded-xl"
                    style={{ borderColor: '#D5A0A8' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Activity & Goal */}
        {step === 2 && (
          <Card className="border-0 shadow-md" style={{ background: 'white' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}>
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                    Activité & Objectif
                  </h2>
                </div>
              </div>

              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block" style={{ color: '#333' }}>Niveau d'activité</Label>
                <div className="space-y-2">
                  {activityLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleInputChange("activity_level", level.value)}
                      className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                        profile.activity_level === level.value ? 'border-[#E37E7F]' : 'border-transparent'
                      }`}
                      style={{ background: profile.activity_level === level.value ? '#FEF2F2' : '#F7F5F2' }}
                    >
                      <p className="font-medium" style={{ color: '#333' }}>{level.label}</p>
                      <p className="text-sm" style={{ color: '#666' }}>{level.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block" style={{ color: '#333' }}>Objectif</Label>
                <div className="grid grid-cols-2 gap-3">
                  {goals.map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => handleInputChange("goal", goal.value)}
                      className={`p-4 rounded-xl text-center transition-all border-2 ${
                        profile.goal === goal.value ? 'border-[#E37E7F]' : 'border-transparent'
                      }`}
                      style={{ background: profile.goal === goal.value ? '#FEF2F2' : '#F7F5F2' }}
                    >
                      <span className="text-2xl mb-2 block">{goal.icon}</span>
                      <p className="font-medium text-sm" style={{ color: '#333' }}>{goal.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Ramadan Habits */}
        {step === 3 && (
          <Card className="border-0 shadow-md" style={{ background: 'white' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}>
                  <Moon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                    Habitudes Ramadan
                  </h2>
                </div>
              </div>

              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block" style={{ color: '#333' }}>Fais-tu le suhoor ?</Label>
                <div className="flex gap-3">
                  {suhoorOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleInputChange("does_suhoor", opt.value)}
                      className={`flex-1 p-4 rounded-xl text-center transition-all border-2 ${
                        profile.does_suhoor === opt.value ? 'border-[#E37E7F]' : 'border-transparent'
                      }`}
                      style={{ background: profile.does_suhoor === opt.value ? '#FEF2F2' : '#F7F5F2' }}
                    >
                      <p className="font-medium" style={{ color: '#333' }}>{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block" style={{ color: '#333' }}>
                  Nombre de repas entre l'iftar et le suhoor ?
                </Label>
                <div className="flex gap-3">
                  {["1", "2", "3"].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleInputChange("meals_count", num)}
                      className={`flex-1 p-4 rounded-xl text-center transition-all border-2 ${
                        profile.meals_count === num ? 'border-[#E37E7F]' : 'border-transparent'
                      }`}
                      style={{ background: profile.meals_count === num ? '#FEF2F2' : '#F7F5F2' }}
                    >
                      <p className="text-2xl font-bold" style={{ color: '#E37E7F' }}>{num}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Eating Habits */}
        {step === 4 && (
          <Card className="border-0 shadow-md" style={{ background: 'white' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}>
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                    Habitudes alimentaires
                  </h2>
                  <p className="text-sm" style={{ color: '#666' }}>Choix multiple</p>
                </div>
              </div>

              <div className="space-y-3">
                {eatingHabits.map((habit) => (
                  <button
                    key={habit}
                    onClick={() => toggleArrayItem("eating_habits", habit)}
                    className={`w-full p-4 rounded-xl text-left transition-all border-2 flex items-center gap-3 ${
                      profile.eating_habits.includes(habit) ? 'border-[#E37E7F]' : 'border-transparent'
                    }`}
                    style={{ background: profile.eating_habits.includes(habit) ? '#FEF2F2' : '#F7F5F2' }}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      profile.eating_habits.includes(habit) ? 'border-[#E37E7F] bg-[#E37E7F]' : 'border-gray-300'
                    }`}>
                      {profile.eating_habits.includes(habit) && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <p className="font-medium" style={{ color: '#333' }}>{habit}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Hydration & Sleep */}
        {step === 5 && (
          <Card className="border-0 shadow-md" style={{ background: 'white' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}>
                  <Droplet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                    Hydratation & Sommeil
                  </h2>
                </div>
              </div>

              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block" style={{ color: '#333' }}>💧 Hydratation</Label>
                <div className="grid grid-cols-2 gap-3">
                  {hydrationLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleInputChange("hydration", level.value)}
                      className={`p-4 rounded-xl text-center transition-all border-2 ${
                        profile.hydration === level.value ? 'border-[#E37E7F]' : 'border-transparent'
                      }`}
                      style={{ background: profile.hydration === level.value ? '#FEF2F2' : '#F7F5F2' }}
                    >
                      <p className="font-medium" style={{ color: '#333' }}>{level.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block" style={{ color: '#333' }}>😴 Sommeil</Label>
                <div className="grid grid-cols-2 gap-3">
                  {sleepOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleInputChange("sleep_hours", opt.value)}
                      className={`p-4 rounded-xl text-center transition-all border-2 ${
                        profile.sleep_hours === opt.value ? 'border-[#E37E7F]' : 'border-transparent'
                      }`}
                      style={{ background: profile.sleep_hours === opt.value ? '#FEF2F2' : '#F7F5F2' }}
                    >
                      <p className="font-medium" style={{ color: '#333' }}>{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 6: Ramadan Feelings */}
        {step === 6 && (
          <Card className="border-0 shadow-md" style={{ background: 'white' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}>
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                    Ressenti pendant Ramadan
                  </h2>
                  <p className="text-sm" style={{ color: '#666' }}>Choix multiple</p>
                </div>
              </div>

              <div className="space-y-3">
                {ramadanFeelings.map((feeling) => (
                  <button
                    key={feeling}
                    onClick={() => toggleArrayItem("ramadan_feelings", feeling)}
                    className={`w-full p-4 rounded-xl text-left transition-all border-2 flex items-center gap-3 ${
                      profile.ramadan_feelings.includes(feeling) ? 'border-[#E37E7F]' : 'border-transparent'
                    }`}
                    style={{ background: profile.ramadan_feelings.includes(feeling) ? '#FEF2F2' : '#F7F5F2' }}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      profile.ramadan_feelings.includes(feeling) ? 'border-[#E37E7F] bg-[#E37E7F]' : 'border-gray-300'
                    }`}>
                      {profile.ramadan_feelings.includes(feeling) && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <p className="font-medium" style={{ color: '#333' }}>{feeling}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Button */}
        <Button
          onClick={saveAndContinue}
          disabled={!canProceed() || calculating}
          className="w-full h-14 rounded-full mt-6 text-lg font-semibold"
          style={{ background: canProceed() ? 'linear-gradient(135deg, #E37E7F, #EE9F80)' : '#ccc' }}
        >
          {calculating ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : step === totalSteps ? (
            "Calculer mes besoins"
          ) : (
            <>
              Continuer
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </main>

      <BottomNavBar />
    </div>
  );
};

export default CalorieProfile;
