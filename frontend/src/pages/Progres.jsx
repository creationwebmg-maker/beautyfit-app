import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import BottomNavBar from "@/components/BottomNavBar";
import { 
  TrendingUp, 
  Footprints, 
  Flame, 
  Calendar,
  Trophy,
  Target,
  Clock
} from "lucide-react";

const Progres = () => {
  // Mock data - à connecter aux vraies données utilisateur
  const [stats] = useState({
    totalSteps: 12450,
    weeklyGoal: 20000,
    sessionsCompleted: 8,
    totalMinutes: 240,
    currentStreak: 5,
    bestStreak: 12
  });

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
