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
  ChevronLeft,
  Utensils,
  Lightbulb,
  Clock,
  Salad,
  Moon,
  Heart,
  Star,
  Quote,
  Mountain,
  MapPin,
  Users,
  Calendar,
  Sun
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
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_fitvid-1/artifacts/h05n68ev_Design%20sans%20titre.png" 
                alt="Beauty Fit by Amel" 
                className="h-16 w-16 md:h-20 md:w-20 object-contain"
              />
              {isAuthenticated && (
                <div>
                  <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Salut, {user?.first_name} ! 👋
                  </h1>
                  <p className="text-xs text-muted-foreground">Prête pour ta dose d'endorphines ?</p>
                </div>
              )}
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
            <span className="text-sm text-muted-foreground">3 programmes</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Programme 1 */}
            <Card 
              className="overflow-hidden cursor-pointer group border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              onClick={() => navigate("/courses")}
            >
              <div className="relative aspect-[3/4]">
                <img
                  src="https://images.unsplash.com/photo-1628258113926-b8d725bbffe9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxhcmFiJTIwd29tYW4lMjB3b3Jrb3V0JTIwc3RyZXRjaGluZyUyMGhlYWx0aHklMjBsaWZlc3R5bGV8ZW58MHx8fHwxNzcwMTMxNzI0fDA&ixlib=rb-4.1.0&q=85"
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
                  src="https://images.unsplash.com/photo-1628258115421-23c0ad739b9b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwyfHxhcmFiJTIwd29tYW4lMjB3b3Jrb3V0JTIwc3RyZXRjaGluZyUyMGhlYWx0aHklMjBsaWZlc3R5bGV8ZW58MHx8fHwxNzcwMTMxNzI0fDA&ixlib=rb-4.1.0&q=85"
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
                  src="https://images.unsplash.com/photo-1628258115387-23c428be3ac4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwzfHxhcmFiJTIwd29tYW4lMjB3b3Jrb3V0JTIwc3RyZXRjaGluZyUyMGhlYWx0aHklMjBsaWZlc3R5bGV8ZW58MHx8fHwxNzcwMTMxNzI0fDA&ixlib=rb-4.1.0&q=85"
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

        {/* Upcoming Events Section */}
        {!isAuthenticated && (
          <div data-testid="upcoming-events-section">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Événements à Venir
                </h2>
                <p className="text-sm text-muted-foreground">Rejoins-nous pour des activités en groupe</p>
              </div>
              <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground">
                Voir tout
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Main Event - Randonnée */}
              <Card className="lg:col-span-2 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white" data-testid="main-event-card">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative md:w-2/5 aspect-video md:aspect-auto">
                      <img 
                        src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80"
                        alt="Randonnée en montagne"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-emerald-600/80 hidden md:block" />
                      <div className="absolute top-3 left-3 bg-white text-emerald-700 rounded-lg p-2 shadow-lg text-center min-w-[60px]">
                        <span className="text-xs font-medium uppercase block">Fév</span>
                        <span className="text-2xl font-bold block leading-none">23</span>
                        <span className="text-xs text-emerald-600">2025</span>
                      </div>
                    </div>
                    <div className="p-5 md:p-6 flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/20 backdrop-blur-sm text-xs px-3 py-1 rounded-full flex items-center gap-1">
                          <Mountain className="w-3 h-3" />
                          Randonnée
                        </span>
                        <span className="bg-amber-400/90 text-emerald-900 text-xs px-3 py-1 rounded-full font-semibold">
                          Places limitées
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Randonnée Fitness en Montagne
                      </h3>
                      <p className="text-white/80 text-sm mb-4 leading-relaxed">
                        Une journée de marche sportive dans un cadre naturel magnifique. 
                        Cardio, renforcement et connexion avec la nature !
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-emerald-200" />
                          <span>Atlas, Maroc</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-emerald-200" />
                          <span>8h00 - 17h00</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-emerald-200" />
                          <span>12 places restantes</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button className="rounded-full bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-6">
                          Réserver ma place
                        </Button>
                        <span className="text-lg font-bold">49€</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mini Calendar */}
              <Card className="border-border/50 overflow-hidden" data-testid="mini-calendar-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-semibold text-foreground">Février 2025</h3>
                  </div>
                  
                  {/* Mini calendar grid */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                      <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">
                        {day}
                      </div>
                    ))}
                    {/* Empty cells for alignment (February 2025 starts on Saturday) */}
                    {[...Array(5)].map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}
                    {/* Days of February */}
                    {[...Array(28)].map((_, i) => {
                      const day = i + 1;
                      const isEvent = day === 23;
                      const isPast = day < 3; // Assuming today is Feb 3
                      return (
                        <div
                          key={day}
                          className={`
                            aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all cursor-pointer
                            ${isEvent 
                              ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 ring-offset-1' 
                              : isPast 
                                ? 'text-muted-foreground/50' 
                                : 'hover:bg-muted text-foreground'
                            }
                          `}
                        >
                          {isEvent ? <Mountain className="w-3 h-3" /> : day}
                        </div>
                      );
                    })}
                  </div>

                  {/* Upcoming events list */}
                  <div className="space-y-2 border-t border-border/50 pt-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prochains événements</p>
                    
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                        <Mountain className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">Randonnée Atlas</p>
                        <p className="text-xs text-muted-foreground">23 Fév • 8h00</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">Yoga Sunrise</p>
                        <p className="text-xs text-muted-foreground">2 Mars • 6h30</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">Bootcamp Plage</p>
                        <p className="text-xs text-muted-foreground">15 Mars • 9h00</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Success Stories Section - Non-authenticated users */}
        {!isAuthenticated && (
          <div data-testid="success-stories-section">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Résultats Motivants
                </h2>
                <p className="text-sm text-muted-foreground">Nos clientes ont transformé leur vie</p>
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Transformation 1 */}
              <Card className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all" data-testid="transformation-1">
                <div className="relative aspect-square">
                  <img
                    src="https://customer-assets.emergentagent.com/job_amelcoach/artifacts/lryd7tpt_AA46CBD1-2C7A-4600-9C5C-FBC90A83B2B5.jpeg"
                    alt="Transformation Sarah"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">-25 kg</span>
                      <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">6 mois</span>
                    </div>
                    <p className="text-white text-sm font-medium">Sarah, 28 ans</p>
                    <p className="text-white/80 text-xs">« Je me sens enfin bien dans ma peau »</p>
                  </div>
                </div>
              </Card>

              {/* Transformation 2 */}
              <Card className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all" data-testid="transformation-2">
                <div className="relative aspect-square">
                  <img
                    src="https://customer-assets.emergentagent.com/job_amelcoach/artifacts/c3i4ig9k_632CEFA9-6343-4197-94E6-304A00E12758.jpeg"
                    alt="Transformation Leila"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">-18 kg</span>
                      <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">4 mois</span>
                    </div>
                    <p className="text-white text-sm font-medium">Leila, 32 ans</p>
                    <p className="text-white/80 text-xs">« Plus d'énergie au quotidien ! »</p>
                  </div>
                </div>
              </Card>

              {/* Transformation 3 */}
              <Card className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all" data-testid="transformation-3">
                <div className="relative aspect-square">
                  <img
                    src="https://customer-assets.emergentagent.com/job_amelcoach/artifacts/kpupfayt_16BCEC9C-6C2A-47BF-B74A-CB270E0B9606.jpeg"
                    alt="Transformation Nadia"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">-30 kg</span>
                      <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">8 mois</span>
                    </div>
                    <p className="text-white text-sm font-medium">Nadia, 35 ans</p>
                    <p className="text-white/80 text-xs">« Une nouvelle vie commence »</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Testimonial Quote */}
            <Card className="mt-4 bg-gradient-to-r from-foreground/5 to-foreground/10 border-0">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Quote className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-foreground/80 italic leading-relaxed">
                      "Grâce à Beauty Fit by Amel, j'ai non seulement perdu du poids mais j'ai aussi gagné en confiance. 
                      Les programmes sont adaptés à notre rythme de vie et les résultats sont incroyables !"
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-3">— Fatima Z.</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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

        {/* Nutrition & Tips Section - Non-authenticated users */}
        {!isAuthenticated && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="nutrition-tips-section">
            {/* Next Meal Suggestion */}
            <Card className="border-border/50 overflow-hidden" data-testid="next-meal-card">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 p-4 border-b border-border/30">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Utensils className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Prochain repas
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Déjeuner • 12h30</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <img 
                        src="https://images.unsplash.com/photo-1636044990022-97492e89a143?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwzfHxtZWRpdGVycmFuZWFuJTIwc2FsYWQlMjBxdWlub2ElMjBjaGlja2VuJTIwaGVhbHRoeSUyMG1lYWx8ZW58MHx8fHwxNzcwMTMyMTM0fDA&ixlib=rb-4.1.0&q=85"
                        alt="Salade Méditerranéenne"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">Salade Méditerranéenne</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Quinoa, poulet grillé, tomates cerises, concombre, feta & huile d'olive
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-emerald-500/10 text-emerald-700 px-2 py-1 rounded-full">450 kcal</span>
                        <span className="text-xs bg-blue-500/10 text-blue-700 px-2 py-1 rounded-full">35g protéines</span>
                        <span className="text-xs bg-amber-500/10 text-amber-700 px-2 py-1 rounded-full">Équilibré</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Tip */}
            <Card className="border-border/50 overflow-hidden" data-testid="daily-tip-card">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-4 border-b border-border/30">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Conseil du jour
                      </h3>
                      <span className="text-xs text-muted-foreground">Récupération & Bien-être</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Moon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Optimise ton sommeil</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Évite les écrans 30 min avant de dormir. La lumière bleue perturbe la production de mélatonine et réduit la qualité de ta récupération musculaire.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>+15% de récupération</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-full"
                      onClick={() => navigate("/conseils")}
                    >
                      Plus de conseils
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
