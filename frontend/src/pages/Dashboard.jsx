import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { 
  Bell, 
  User,
  Play, 
  Flame,
  Target,
  ChevronRight,
  Dumbbell,
  TrendingUp,
  Check,
  ChevronLeft
} from "lucide-react";

// Activity Calendar Component
const ActivityCalendar = ({ activeDays = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysOfWeek = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    
    return { daysInMonth, startDay };
  };

  const { daysInMonth, startDay } = getDaysInMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

  const isActiveDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return activeDays.includes(dateStr);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const calendarDays = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const totalActiveDaysThisMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .filter(day => isActiveDay(day)).length;

  return (
    <Card className="border-border/50" data-testid="activity-calendar">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              Mes jours d'activité
            </h3>
            <p className="text-sm text-muted-foreground">
              {totalActiveDaysThisMonth} jours actifs ce mois
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={index} className="aspect-square" />;
            }
            
            const isToday = isCurrentMonth && day === today.getDate();
            const isActive = isActiveDay(day);
            const isPast = isCurrentMonth ? day < today.getDate() : currentDate < today;
            
            return (
              <div
                key={index}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all relative
                  ${isActive ? 'bg-green-500 text-white' : isPast ? 'bg-muted/50 text-muted-foreground' : 'bg-muted/30 text-foreground/70'}
                  ${isToday ? 'ring-2 ring-foreground ring-offset-2' : ''}
                `}
              >
                {isActive ? <Check className="w-4 h-4" /> : day}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs text-muted-foreground">Actif</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted/50" />
            <span className="text-xs text-muted-foreground">Inactif</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted/30 ring-2 ring-foreground ring-offset-1" />
            <span className="text-xs text-muted-foreground">Aujourd'hui</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [activeDays] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return [
      `${year}-${month}-02`, `${year}-${month}-03`, `${year}-${month}-05`,
      `${year}-${month}-07`, `${year}-${month}-08`, `${year}-${month}-10`,
      `${year}-${month}-12`, `${year}-${month}-14`, `${year}-${month}-15`,
      `${year}-${month}-17`, `${year}-${month}-19`, `${year}-${month}-21`,
      `${year}-${month}-22`, `${year}-${month}-24`, `${year}-${month}-26`,
      `${year}-${month}-28`,
    ];
  });

  const [progressData] = useState({
    sessionsCompleted: 3,
    sessionsGoal: 4,
    caloriesBurned: 1250,
    streak: 5
  });

  const isAuthenticated = !!token;
  const progressPercentage = (progressData.sessionsCompleted / progressData.sessionsGoal) * 100;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_fitvid-1/artifacts/h05n68ev_Design%20sans%20titre.png" 
                alt="Beauty Fit by Amel" 
                className="h-10 w-10 object-contain"
              />
              <div>
                {isAuthenticated ? (
                  <>
                    <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Salut, {user?.first_name} ! 👋
                    </h1>
                    <p className="text-xs text-muted-foreground">Prête pour ta dose d'endorphines ?</p>
                  </>
                ) : (
                  <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Beauty Fit by Amel
                  </h1>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/settings")}>
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => navigate("/account")}>
                    <div className="w-8 h-8 rounded-full bg-accent/50 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/login")} className="text-sm">
                    Connexion
                  </Button>
                  <Button onClick={() => navigate("/register")} className="rounded-full bg-foreground text-background text-sm">
                    S'inscrire
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        
        {/* Programmes Section */}
        <div data-testid="programmes-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              Nos Programmes
            </h2>
            <span className="text-sm text-muted-foreground">3 produits</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Programme 1 */}
            <Card 
              className="overflow-hidden cursor-pointer group border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              onClick={() => navigate("/courses")}
            >
              <div className="relative aspect-[3/4]">
                <img
                  src="https://images.pexels.com/photos/5132092/pexels-photo-5132092.jpeg"
                  alt="Programme Éliminer les excès de l'été"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Programme</p>
                  <h3 className="text-lg font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    ÉLIMINER LES EXCÈS DE L'ÉTÉ !
                  </h3>
                </div>
              </div>
            </Card>

            {/* Programme 2 */}
            <Card 
              className="overflow-hidden cursor-pointer group border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              onClick={() => navigate("/courses")}
            >
              <div className="relative aspect-[3/4]">
                <img
                  src="https://images.unsplash.com/photo-1645810798586-08e892108d67?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGZpdG5lc3MlMjBncmV5JTIwc3dlYXRwYW50cyUyMGF0aGxldGljJTIwY2FzdWFsfGVufDB8fHx8MTc3MDEzMDQ1OHww&ixlib=rb-4.1.0&q=85"
                  alt="Programme Ramadan"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className="text-2xl">🌙</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xs text-amber-400 uppercase tracking-wider mb-1">Programme</p>
                  <h3 className="text-lg font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    PROGRAMME RAMADHÂN
                  </h3>
                </div>
              </div>
            </Card>

            {/* Programme 3 */}
            <Card 
              className="overflow-hidden cursor-pointer group border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              onClick={() => navigate("/courses")}
            >
              <div className="relative aspect-[3/4]">
                <img
                  src="https://images.unsplash.com/photo-1517574394752-94986fc2c084?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwyfHxtaW5pbWFsaXN0JTIwcmFtYWRhbiUyMGFyY2hlcyUyMG1vcm9jY2FuJTIwd2hpdGUlMjBnb2xkJTIwZWxlZ2FudHxlbnwwfHx8fDE3NzAxMzA0NjJ8MA&ixlib=rb-4.1.0&q=85"
                  alt="Ramadan Minimaliste"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
                <div className="absolute top-3 right-3">
                  <span className="text-2xl">✨</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-lg text-center shadow-lg">
                    <p className="text-amber-600 text-xs uppercase tracking-widest mb-1">Ramadan</p>
                    <h3 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                      MINIMALISTE
                    </h3>
                    <div className="flex justify-center gap-1 mt-2">
                      <span className="text-amber-500">🌙</span>
                      <span className="text-amber-500">🌙</span>
                      <span className="text-amber-500">🌙</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Ramadan Banner */}
        <Card 
          className="overflow-hidden cursor-pointer group border-0 shadow-xl bg-gradient-to-r from-amber-900 to-amber-700"
          onClick={() => navigate("/courses")}
        >
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🌙</div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Ne perds pas ton rythme pendant le Ramadan
                  </h3>
                  <p className="text-amber-200 text-sm mt-1">Des programmes adaptés pour garder la forme</p>
                </div>
              </div>
              <Button
                className="rounded-full bg-white text-amber-900 hover:bg-amber-100 font-semibold px-6"
                onClick={(e) => { e.stopPropagation(); navigate("/courses"); }}
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                Découvrir
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Widget - Authenticated only */}
        {isAuthenticated && (
          <Card className="bg-gradient-to-r from-foreground to-foreground/90 text-background overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">Progression de la semaine</span>
                </div>
                <span className="text-sm opacity-80">🔥 {progressData.streak} jours</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="opacity-80">Séances</span>
                    <span className="font-bold">{progressData.sessionsCompleted}/{progressData.sessionsGoal}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2 bg-background/20" />
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{progressData.caloriesBurned.toLocaleString()}</p>
                    <p className="text-xs opacity-80">kcal brûlées</p>
                  </div>
                </div>
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                className="w-full bg-background/20 hover:bg-background/30 text-background border-0 rounded-full"
                onClick={() => navigate("/account")}
              >
                Voir mes statistiques complètes
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Activity Calendar - Authenticated only */}
        {isAuthenticated && <ActivityCalendar activeDays={activeDays} />}

        {/* CTA for non-authenticated users */}
        {!isAuthenticated && (
          <Card className="bg-accent/20 border-accent/30">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Rejoins Beauty Fit by Amel
              </h3>
              <p className="text-muted-foreground mb-4">
                Inscris-toi pour suivre ta progression et accéder à tous les programmes
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate("/register")} className="rounded-full bg-foreground text-background">
                  Créer mon compte gratuit
                </Button>
                <Button variant="outline" onClick={() => navigate("/login")} className="rounded-full">
                  J'ai déjà un compte
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50 md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {[
            { path: "/courses", label: "Entraînements", icon: Dumbbell },
            { path: "/conseils", label: "Conseils", icon: Target },
            { path: isAuthenticated ? "/account" : "/login", label: "Mon espace", icon: User },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all text-muted-foreground"
            >
              <div className="p-2 rounded-full bg-transparent">
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
