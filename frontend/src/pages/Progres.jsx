import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import BottomNavBar from "@/components/BottomNavBar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/utils";
import { 
  TrendingUp, 
  Footprints, 
  Flame, 
  Calendar,
  Trophy,
  Target,
  Clock,
  Apple,
  Wheat,
  Droplet,
  Camera,
  ChevronRight
} from "lucide-react";

const Progres = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated, isGuest } = useAuth();
  
  // Mock data - à connecter aux vraies données utilisateur
  const [stats] = useState({
    totalSteps: 12450,
    weeklyGoal: 20000,
    sessionsCompleted: 8,
    totalMinutes: 240,
    currentStreak: 5,
    bestStreak: 12
  });

  const [calorieData, setCalorieData] = useState(null);
  const [loadingCalories, setLoadingCalories] = useState(true);

  useEffect(() => {
    if (isAuthenticated && !isGuest && token) {
      fetchCalorieData();
    } else {
      setLoadingCalories(false);
    }
  }, [isAuthenticated, isGuest, token]);

  const fetchCalorieData = async () => {
    try {
      const data = await api.get("/calories/today", token);
      setCalorieData(data);
    } catch (error) {
      console.error("Error fetching calorie data:", error);
    } finally {
      setLoadingCalories(false);
    }
  };

  const weekProgress = (stats.totalSteps / stats.weeklyGoal) * 100;

  const weekDays = ["L", "M", "M", "J", "V", "S", "D"];
  const activityDays = [true, true, false, true, true, false, false]; // Exemple

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F7F5F2' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b" style={{ background: '#F7F5F2', borderColor: '#D2DDE7' }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
            Mes Progrès
          </h1>
          <p className="text-sm" style={{ color: '#666' }}>Suis ton évolution semaine après semaine</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Weekly Progress Card */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }} className="p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm">Cette semaine</p>
                <p className="text-3xl font-bold">{stats.totalSteps.toLocaleString()}</p>
                <p className="text-white/80 text-sm">pas</p>
              </div>
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <Footprints className="w-10 h-10" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Objectif: {stats.weeklyGoal.toLocaleString()} pas</span>
                <span>{Math.round(weekProgress)}%</span>
              </div>
              <Progress value={weekProgress} className="h-3 bg-white/20" />
            </div>
          </div>
        </Card>

        {/* Calorie Tracker Section */}
        <Card className="border-0 shadow-md" style={{ background: 'white' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                <Flame className="w-5 h-5" style={{ color: '#E37E7F' }} />
                Calories du jour
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/calories")}
                className="text-sm rounded-full"
                style={{ color: '#E37E7F' }}
              >
                Voir plus
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {loadingCalories ? (
              <div className="h-32 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#E37E7F] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !isAuthenticated || isGuest ? (
              <div className="text-center py-6">
                <Camera className="w-10 h-10 mx-auto mb-3" style={{ color: '#D5A0A8' }} />
                <p className="text-sm mb-3" style={{ color: '#666' }}>Connectez-vous pour suivre vos calories</p>
                <Button
                  onClick={() => navigate("/login")}
                  size="sm"
                  className="rounded-full"
                  style={{ background: '#E37E7F' }}
                >
                  Se connecter
                </Button>
              </div>
            ) : calorieData ? (
              <>
                {/* Calories Progress Circle */}
                <div className="flex items-center gap-6 mb-4">
                  <div className="relative">
                    <div 
                      className="w-24 h-24 rounded-full flex flex-col items-center justify-center"
                      style={{ 
                        background: `conic-gradient(#E37E7F ${Math.min((calorieData.consumed.calories / calorieData.goal.calories) * 360, 360)}deg, #f0f0f0 0deg)`,
                        padding: '6px'
                      }}
                    >
                      <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
                        <span className="text-xl font-bold" style={{ color: '#333' }}>
                          {calorieData.consumed.calories}
                        </span>
                        <span className="text-xs" style={{ color: '#666' }}>
                          / {calorieData.goal.calories}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    {/* Proteins */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1" style={{ color: '#666' }}>
                          <Apple className="w-3 h-3" style={{ color: '#E37E7F' }} />
                          Protéines
                        </span>
                        <span style={{ color: '#333' }}>{calorieData.consumed.proteins}g / {calorieData.goal.proteins}g</span>
                      </div>
                      <Progress 
                        value={Math.min((calorieData.consumed.proteins / calorieData.goal.proteins) * 100, 100)} 
                        className="h-2"
                      />
                    </div>
                    
                    {/* Carbs */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1" style={{ color: '#666' }}>
                          <Wheat className="w-3 h-3" style={{ color: '#EE9F80' }} />
                          Glucides
                        </span>
                        <span style={{ color: '#333' }}>{calorieData.consumed.carbs}g / {calorieData.goal.carbs}g</span>
                      </div>
                      <Progress 
                        value={Math.min((calorieData.consumed.carbs / calorieData.goal.carbs) * 100, 100)} 
                        className="h-2"
                      />
                    </div>
                    
                    {/* Fats */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1" style={{ color: '#666' }}>
                          <Droplet className="w-3 h-3" style={{ color: '#D5A0A8' }} />
                          Lipides
                        </span>
                        <span style={{ color: '#333' }}>{calorieData.consumed.fats}g / {calorieData.goal.fats}g</span>
                      </div>
                      <Progress 
                        value={Math.min((calorieData.consumed.fats / calorieData.goal.fats) * 100, 100)} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Add Button */}
                <Button
                  onClick={() => navigate("/calories")}
                  className="w-full rounded-full"
                  style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Ajouter un repas
                </Button>
              </>
            ) : (
              <div className="text-center py-6">
                <Flame className="w-10 h-10 mx-auto mb-3" style={{ color: '#D5A0A8' }} />
                <p className="text-sm mb-3" style={{ color: '#666' }}>Aucun repas enregistré aujourd'hui</p>
                <Button
                  onClick={() => navigate("/calories")}
                  size="sm"
                  className="rounded-full"
                  style={{ background: '#E37E7F' }}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Ajouter un repas
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Calendar */}
        <Card className="border-0 shadow-md" style={{ background: 'white' }}>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#333' }}>
              <Calendar className="w-5 h-5" style={{ color: '#E37E7F' }} />
              Activité de la semaine
            </h3>
            <div className="flex justify-between">
              {weekDays.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <span className="text-xs" style={{ color: '#999' }}>{day}</span>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ 
                      background: activityDays[idx] ? 'linear-gradient(135deg, #E37E7F, #EE9F80)' : '#f0f0f0'
                    }}
                  >
                    {activityDays[idx] && <Flame className="w-5 h-5 text-white" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-md" style={{ background: 'white' }}>
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: '#D5A0A8' }}>
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold" style={{ color: '#333' }}>{stats.sessionsCompleted}</p>
              <p className="text-sm" style={{ color: '#666' }}>Séances complétées</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md" style={{ background: 'white' }}>
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: '#EE9F80' }}>
                <Clock className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold" style={{ color: '#333' }}>{stats.totalMinutes}</p>
              <p className="text-sm" style={{ color: '#666' }}>Minutes d'activité</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md" style={{ background: 'white' }}>
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: '#E37E7F' }}>
                <Flame className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold" style={{ color: '#333' }}>{stats.currentStreak}</p>
              <p className="text-sm" style={{ color: '#666' }}>Jours d'affilée</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md" style={{ background: 'white' }}>
            <CardContent className="p-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: '#D5A0A8' }}>
                <Target className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold" style={{ color: '#333' }}>{stats.bestStreak}</p>
              <p className="text-sm" style={{ color: '#666' }}>Meilleure série</p>
            </CardContent>
          </Card>
        </div>

        {/* Motivation Card */}
        <Card className="border-0 shadow-md" style={{ background: 'linear-gradient(135deg, #D5A0A8, #E37E7F)' }}>
          <CardContent className="p-5 text-center text-white">
            <TrendingUp className="w-8 h-8 mx-auto mb-3" />
            <p className="font-semibold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              Continue comme ça ! 💪
            </p>
            <p className="text-sm text-white/80 mt-2">
              Tu es sur la bonne voie pour atteindre ton objectif cette semaine.
            </p>
          </CardContent>
        </Card>
      </main>

      <BottomNavBar />
    </div>
  );
};

export default Progres;
