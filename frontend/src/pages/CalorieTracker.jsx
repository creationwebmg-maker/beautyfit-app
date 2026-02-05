import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Camera, 
  Image as ImageIcon, 
  Loader2, 
  Flame,
  Apple,
  Wheat,
  Droplet,
  ChevronLeft,
  Trash2,
  Calendar,
  Target,
  X,
  PenLine,
  Send
} from "lucide-react";
import { Input } from "@/components/ui/input";
import BottomNavBar from "@/components/BottomNavBar";

const CalorieTracker = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated, isGuest } = useAuth();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [todaySummary, setTodaySummary] = useState(null);
  const [mealHistory, setMealHistory] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showResult, setShowResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mealText, setMealText] = useState("");
  const [analyzingText, setAnalyzingText] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isGuest) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isGuest, token]);

  const fetchData = async () => {
    try {
      const [summary, history] = await Promise.all([
        api.get("/calories/today", token),
        api.get("/calories/history?limit=10", token)
      ]);
      setTodaySummary(summary);
      setMealHistory(history);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result.split(",")[1];
      setSelectedImage(e.target.result);
      await analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64) => {
    setAnalyzing(true);
    try {
      const result = await api.post("/calories/analyze", {
        image_base64: base64,
        meal_type: getMealType()
      }, token);
      
      setShowResult(result);
      toast.success("Analyse terminée !");
      
      // Refresh data
      fetchData();
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'analyse");
    } finally {
      setAnalyzing(false);
    }
  };

  const getMealType = () => {
    const hour = new Date().getHours();
    if (hour < 10) return "petit-dejeuner";
    if (hour < 14) return "dejeuner";
    if (hour < 18) return "collation";
    return "diner";
  };

  const deleteMeal = async (mealId) => {
    try {
      await api.delete(`/calories/meal/${mealId}`, token);
      toast.success("Repas supprimé");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getProgressColor = (consumed, goal) => {
    const percentage = (consumed / goal) * 100;
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    if (percentage < 100) return "bg-orange-500";
    return "bg-red-500";
  };

  // Not authenticated view
  if (!isAuthenticated || isGuest) {
    return (
      <div className="min-h-screen pb-24" style={{ background: '#F7F5F2' }}>
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
                Compteur de Calories
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card className="border-0 shadow-md" style={{ background: 'white' }}>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}>
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                Connectez-vous pour utiliser cette fonctionnalité
              </h2>
              <p className="mb-6" style={{ color: '#666' }}>
                Le compteur de calories nécessite un compte pour sauvegarder votre historique.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => navigate("/register")}
                  className="rounded-full"
                  style={{ background: '#E37E7F' }}
                  data-testid="register-btn"
                >
                  Créer mon compte
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="rounded-full"
                  style={{ borderColor: '#D5A0A8', color: '#D5A0A8' }}
                  data-testid="login-btn"
                >
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

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F7F5F2' }} data-testid="calorie-tracker-page">
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
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                Compteur de Calories
              </h1>
              <p className="text-sm" style={{ color: '#666' }}>
                Photographiez votre repas
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Today's Summary */}
        {loading ? (
          <Card className="border-0 shadow-md animate-pulse" style={{ background: 'white' }}>
            <CardContent className="p-6 h-48" />
          </Card>
        ) : todaySummary && (
          <Card className="border-0 shadow-md" style={{ background: 'white' }} data-testid="today-summary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                  Aujourd'hui
                </h2>
                <span className="text-sm" style={{ color: '#666' }}>
                  {todaySummary.meals_count} repas
                </span>
              </div>

              {/* Calories Main */}
              <div className="text-center mb-6">
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full flex flex-col items-center justify-center" 
                    style={{ 
                      background: `conic-gradient(#E37E7F ${Math.min((todaySummary.consumed.calories / todaySummary.goal.calories) * 360, 360)}deg, #f0f0f0 0deg)`,
                      padding: '8px'
                    }}>
                    <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
                      <Flame className="w-6 h-6 mb-1" style={{ color: '#E37E7F' }} />
                      <span className="text-2xl font-bold" style={{ color: '#333' }}>
                        {todaySummary.consumed.calories}
                      </span>
                      <span className="text-xs" style={{ color: '#666' }}>
                        / {todaySummary.goal.calories} kcal
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-4">
                {/* Proteins */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Apple className="w-4 h-4" style={{ color: '#E37E7F' }} />
                    <span className="text-sm font-medium" style={{ color: '#333' }}>Protéines</span>
                  </div>
                  <Progress 
                    value={Math.min((todaySummary.consumed.proteins / todaySummary.goal.proteins) * 100, 100)} 
                    className="h-2 mb-1"
                  />
                  <span className="text-xs" style={{ color: '#666' }}>
                    {todaySummary.consumed.proteins}g / {todaySummary.goal.proteins}g
                  </span>
                </div>

                {/* Carbs */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Wheat className="w-4 h-4" style={{ color: '#EE9F80' }} />
                    <span className="text-sm font-medium" style={{ color: '#333' }}>Glucides</span>
                  </div>
                  <Progress 
                    value={Math.min((todaySummary.consumed.carbs / todaySummary.goal.carbs) * 100, 100)} 
                    className="h-2 mb-1"
                  />
                  <span className="text-xs" style={{ color: '#666' }}>
                    {todaySummary.consumed.carbs}g / {todaySummary.goal.carbs}g
                  </span>
                </div>

                {/* Fats */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Droplet className="w-4 h-4" style={{ color: '#D5A0A8' }} />
                    <span className="text-sm font-medium" style={{ color: '#333' }}>Lipides</span>
                  </div>
                  <Progress 
                    value={Math.min((todaySummary.consumed.fats / todaySummary.goal.fats) * 100, 100)} 
                    className="h-2 mb-1"
                  />
                  <span className="text-xs" style={{ color: '#666' }}>
                    {todaySummary.consumed.fats}g / {todaySummary.goal.fats}g
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Camera Buttons */}
        <Card className="border-0 shadow-md" style={{ background: 'white' }}>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-center" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
              Analyser un repas
            </h2>
            
            <div className="flex gap-4 justify-center">
              {/* Camera Button */}
              <Button
                onClick={() => cameraInputRef.current?.click()}
                disabled={analyzing}
                className="flex-1 h-24 rounded-2xl flex flex-col items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}
                data-testid="camera-btn"
              >
                {analyzing ? (
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
                <span className="text-white text-sm font-medium">Prendre une photo</span>
              </Button>

              {/* Gallery Button */}
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzing}
                variant="outline"
                className="flex-1 h-24 rounded-2xl flex flex-col items-center justify-center gap-2"
                style={{ borderColor: '#D5A0A8', color: '#D5A0A8' }}
                data-testid="gallery-btn"
              >
                {analyzing ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <ImageIcon className="w-8 h-8" />
                )}
                <span className="text-sm font-medium">Choisir une image</span>
              </Button>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {analyzing && (
              <div className="mt-4 text-center">
                <p className="text-sm" style={{ color: '#666' }}>
                  Analyse en cours... Cela peut prendre quelques secondes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Result Modal */}
        {showResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto border-0 shadow-xl" style={{ background: 'white' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                    Résultat de l'analyse
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowResult(null);
                      setSelectedImage(null);
                    }}
                    className="rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {selectedImage && (
                  <img 
                    src={selectedImage} 
                    alt="Repas analysé" 
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                )}

                <p className="text-sm mb-4" style={{ color: '#666' }}>
                  {showResult.analysis_text}
                </p>

                {/* Foods List */}
                <div className="space-y-3 mb-4">
                  {showResult.foods.map((food, index) => (
                    <div key={index} className="flex justify-between items-center p-3 rounded-xl" style={{ background: '#F7F5F2' }}>
                      <div>
                        <p className="font-medium" style={{ color: '#333' }}>{food.name}</p>
                        <p className="text-xs" style={{ color: '#666' }}>{food.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: '#E37E7F' }}>{food.calories} kcal</p>
                        <p className="text-xs" style={{ color: '#666' }}>
                          P:{food.proteins}g G:{food.carbs}g L:{food.fats}g
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}>
                  <div className="flex justify-between items-center text-white">
                    <span className="font-medium">Total</span>
                    <span className="text-2xl font-bold">{showResult.total_calories} kcal</span>
                  </div>
                  <div className="flex justify-between text-white/80 text-sm mt-2">
                    <span>Protéines: {showResult.total_proteins}g</span>
                    <span>Glucides: {showResult.total_carbs}g</span>
                    <span>Lipides: {showResult.total_fats}g</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setShowResult(null);
                    setSelectedImage(null);
                  }}
                  className="w-full mt-4 rounded-full"
                  style={{ background: '#E37E7F' }}
                  data-testid="close-result-btn"
                >
                  Fermer
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Meal History */}
        <Card className="border-0 shadow-md" style={{ background: 'white' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                Historique des repas
              </h2>
              <Calendar className="w-5 h-5" style={{ color: '#D5A0A8' }} />
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : mealHistory.length === 0 ? (
              <div className="text-center py-8">
                <Camera className="w-12 h-12 mx-auto mb-3" style={{ color: '#D5A0A8' }} />
                <p style={{ color: '#666' }}>Aucun repas enregistré</p>
                <p className="text-sm" style={{ color: '#999' }}>
                  Prenez une photo de votre repas pour commencer !
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {mealHistory.map((meal) => (
                  <div 
                    key={meal.id} 
                    className="flex justify-between items-center p-4 rounded-xl"
                    style={{ background: '#F7F5F2' }}
                    data-testid={`meal-history-${meal.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: '#E37E7F', color: 'white' }}>
                          {meal.meal_type}
                        </span>
                        <span className="text-xs" style={{ color: '#666' }}>
                          {new Date(meal.created_at).toLocaleString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm mt-1 line-clamp-1" style={{ color: '#333' }}>
                        {meal.foods.map(f => f.name).join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold" style={{ color: '#E37E7F' }}>{meal.total_calories}</p>
                        <p className="text-xs" style={{ color: '#666' }}>kcal</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMeal(meal.id)}
                        className="rounded-full hover:bg-red-50"
                        data-testid={`delete-meal-${meal.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNavBar />
    </div>
  );
};

export default CalorieTracker;
