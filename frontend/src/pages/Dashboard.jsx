import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { api, formatPrice, formatDuration, getLevelColor } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Bell, 
  User,
  Play, 
  Clock, 
  Flame,
  Target,
  ChevronRight,
  Dumbbell,
  Heart,
  Leaf,
  Users,
  Zap,
  TrendingUp,
  Calendar,
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
    
    // Get the day of week for the first day (0 = Sunday, convert to Monday = 0)
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

  // Generate calendar grid
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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 
              className="text-lg font-semibold text-foreground"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
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

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
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
                  aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                  transition-all relative
                  ${isActive 
                    ? 'bg-green-500 text-white' 
                    : isPast 
                      ? 'bg-muted/50 text-muted-foreground' 
                      : 'bg-muted/30 text-foreground/70'
                  }
                  ${isToday ? 'ring-2 ring-foreground ring-offset-2' : ''}
                `}
                data-testid={`calendar-day-${day}`}
              >
                {isActive ? (
                  <Check className="w-4 h-4" />
                ) : (
                  day
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
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
  const [courses, setCourses] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayCourse, setTodayCourse] = useState(null);

  // Simulated activity days (would come from backend in production)
  const [activeDays] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    // Simulate some active days this month
    return [
      `${year}-${month}-02`,
      `${year}-${month}-03`,
      `${year}-${month}-05`,
      `${year}-${month}-07`,
      `${year}-${month}-08`,
      `${year}-${month}-10`,
      `${year}-${month}-12`,
      `${year}-${month}-14`,
      `${year}-${month}-15`,
      `${year}-${month}-17`,
      `${year}-${month}-19`,
      `${year}-${month}-21`,
      `${year}-${month}-22`,
      `${year}-${month}-24`,
      `${year}-${month}-26`,
      `${year}-${month}-28`,
    ];
  });

  // Simulated progress data (would come from backend in production)
  const [progressData] = useState({
    sessionsCompleted: 3,
    sessionsGoal: 4,
    caloriesBurned: 1250,
    streak: 5
  });

  const categories = [
    { id: "musculation", name: "Musculation", icon: Dumbbell, color: "bg-rose-100 text-rose-700" },
    { id: "cardio", name: "Cardio", icon: Heart, color: "bg-red-100 text-red-700" },
    { id: "yoga", name: "Yoga & Étirements", icon: Leaf, color: "bg-green-100 text-green-700" },
    { id: "collectifs", name: "Cours Collectifs", icon: Users, color: "bg-purple-100 text-purple-700" },
  ];

  const isAuthenticated = !!token;

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const allCourses = await api.get("/courses");
      setCourses(allCourses);
      
      // Only fetch user courses if authenticated
      if (token) {
        try {
          const userCourses = await api.get("/user/courses", token);
          setPurchasedCourses(userCourses);
        } catch (e) {
          console.log("User courses not available");
        }
      }
      
      // Set a random course as "today's session"
      if (allCourses.length > 0) {
        const randomIndex = Math.floor(Math.random() * allCourses.length);
        setTodayCourse(allCourses[randomIndex]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (progressData.sessionsCompleted / progressData.sessionsGoal) * 100;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Custom Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Greeting / Logo */}
            <div>
              {isAuthenticated ? (
                <>
                  <h1 
                    className="text-xl font-bold text-foreground"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                    data-testid="greeting"
                  >
                    Salut, {user?.first_name} ! 👋
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Prête pour ta dose d'endorphines ?
                  </p>
                </>
              ) : (
                <h1 
                  className="text-xl font-bold text-foreground"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  data-testid="logo"
                >
                  Amel Fit Coach
                </h1>
              )}
            </div>

            {/* Icons / Auth buttons */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => navigate("/settings")}
                    data-testid="notifications-btn"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/account")}
                    data-testid="profile-btn"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/50 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/login")}
                    className="text-sm"
                    data-testid="login-btn"
                  >
                    Connexion
                  </Button>
                  <Button
                    onClick={() => navigate("/register")}
                    className="rounded-full bg-foreground text-background text-sm"
                    data-testid="register-btn"
                  >
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
        
        {/* 🌙 RAMADAN SPECIAL BANNER */}
        <Card 
          className="overflow-hidden cursor-pointer group border-0 shadow-xl"
          onClick={() => navigate("/courses")}
          data-testid="ramadan-banner"
        >
          <div className="relative aspect-[21/9] md:aspect-[3/1]">
            <img
              src="https://images.unsplash.com/photo-1578704311507-15aa141d9a8e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHwxfHxyYW1hZGFuJTIwZml0bmVzcyUyMHdvcmtvdXQlMjBoZWFsdGh5JTIwd29tYW4lMjBtdXNsaW18ZW58MHx8fHwxNzcwMTI5OTE3fDA&ixlib=rb-4.1.0&q=85"
              alt="Programme Ramadan"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
            
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 text-4xl md:text-6xl opacity-30">
              🌙
            </div>
            
            {/* Content */}
            <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-center">
              <div className="max-w-lg space-y-3">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 w-fit">
                  <span className="text-amber-400">🌙</span>
                  <span className="text-amber-300 text-xs md:text-sm font-medium uppercase tracking-wider">
                    Programme Spécial
                  </span>
                </div>
                
                {/* Title */}
                <h2 
                  className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Programme Ramadan
                </h2>
                
                {/* Subtitle */}
                <p className="text-lg md:text-xl text-white/90 font-handwritten">
                  Ne perds pas ton rythme pendant le Ramadan ✨
                </p>
                
                {/* CTA Button */}
                <Button
                  className="mt-2 h-12 px-8 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-base transition-all hover:scale-105"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/courses");
                  }}
                  data-testid="ramadan-cta-btn"
                >
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Découvrir le programme
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Progress Widget - Only for authenticated users */}
        {isAuthenticated && (
          <Card className="bg-gradient-to-r from-foreground to-foreground/90 text-background overflow-hidden" data-testid="progress-widget">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">Progression de la semaine</span>
                </div>
                <span className="text-sm opacity-80">
                  🔥 {progressData.streak} jours
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Sessions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="opacity-80">Séances</span>
                    <span className="font-bold">{progressData.sessionsCompleted}/{progressData.sessionsGoal}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2 bg-background/20" />
                </div>
                
                {/* Calories */}
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
                data-testid="view-stats-btn"
              >
                Voir mes statistiques complètes
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Activity Calendar - Only for authenticated users */}
        {isAuthenticated && <ActivityCalendar activeDays={activeDays} />}

        {/* Today's Session - Main Hero */}
        {todayCourse && (
          <div data-testid="todays-session">
            <div className="flex items-center justify-between mb-3">
              <h2 
                className="text-xl font-semibold text-foreground"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Séance du jour
              </h2>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            
            <Card 
              className="overflow-hidden cursor-pointer group"
              onClick={() => navigate(`/courses/${todayCourse.id}`)}
              data-testid="today-course-card"
            >
              <div className="relative aspect-[16/9] md:aspect-[21/9]">
                <img
                  src={todayCourse.thumbnail_url}
                  alt={todayCourse.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Content overlay */}
                <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-end">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400" />
                      <span className="text-white/90 text-sm font-medium">Recommandé pour toi</span>
                    </div>
                    
                    <h3 
                      className="text-2xl md:text-4xl font-bold text-white"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {todayCourse.title} ⚡
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-3 text-white/80 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(todayCourse.duration_minutes)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                        {todayCourse.level}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                        {todayCourse.category}
                      </span>
                    </div>
                    
                    <Button
                      className="mt-2 h-12 px-8 rounded-full bg-white text-foreground hover:bg-white/90 font-semibold text-base"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/courses/${todayCourse.id}`);
                      }}
                      data-testid="start-session-btn"
                    >
                      <Play className="w-5 h-5 mr-2 fill-current" />
                      COMMENCER LA SÉANCE
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Categories */}
        <div data-testid="categories-section">
          <h2 
            className="text-xl font-semibold text-foreground mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Catégories d'entraînement
          </h2>
          
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => navigate(`/courses?category=${category.name}`)}
                className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border/50 hover:border-accent/50 transition-all hover:-translate-y-1 min-w-[100px]"
                data-testid={`category-${category.id}`}
              >
                <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center`}>
                  <category.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-foreground text-center">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Purchased Courses / Continue Training - Only for authenticated users */}
        {isAuthenticated && purchasedCourses.length > 0 && (
          <div data-testid="my-courses-section">
            <div className="flex items-center justify-between mb-4">
              <h2 
                className="text-xl font-semibold text-foreground"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Reprendre l'entraînement
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/account")}
                className="text-muted-foreground"
              >
                Voir tout
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
              {purchasedCourses.slice(0, 4).map((course) => (
                <Card 
                  key={course.id}
                  className="flex-shrink-0 w-[280px] overflow-hidden cursor-pointer group hover:border-accent/50 transition-all"
                  onClick={() => navigate(`/watch/${course.id}`)}
                  data-testid={`continue-course-${course.id}`}
                >
                  <div className="relative aspect-video">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-5 h-5 text-foreground fill-foreground ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-foreground text-sm line-clamp-1">{course.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDuration(course.duration_minutes)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Popular Courses */}
        <div data-testid="popular-courses-section">
          <div className="flex items-center justify-between mb-4">
            <h2 
              className="text-xl font-semibold text-foreground"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Cours populaires
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/courses")}
              className="text-muted-foreground"
            >
              Explorer
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
              ))
            ) : (
              courses.slice(0, 3).map((course) => (
                <Card 
                  key={course.id}
                  className="overflow-hidden cursor-pointer group hover:border-accent/50 transition-all hover:-translate-y-1"
                  onClick={() => navigate(`/courses/${course.id}`)}
                  data-testid={`popular-course-${course.id}`}
                >
                  <div className="relative aspect-video">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 rounded-full bg-white/95 text-foreground text-sm font-medium">
                        {formatPrice(course.price)}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      {course.category}
                    </span>
                    <h4 className="font-semibold text-foreground mt-1 line-clamp-1">{course.title}</h4>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(course.duration_minutes)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getLevelColor(course.level)}`}>
                        {course.level}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* CTA for non-authenticated users */}
        {!isAuthenticated && (
          <Card className="bg-accent/20 border-accent/30">
            <CardContent className="p-6 text-center">
              <h3 
                className="text-xl font-semibold text-foreground mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Rejoins Amel Fit Coach
              </h3>
              <p className="text-muted-foreground mb-4">
                Inscris-toi pour suivre ta progression et accéder à tous les cours
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate("/register")}
                  className="rounded-full bg-foreground text-background"
                  data-testid="cta-register-btn"
                >
                  Créer mon compte gratuit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="rounded-full"
                  data-testid="cta-login-btn"
                >
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
              data-testid={`bottom-nav-${item.label.toLowerCase().replace(' ', '-')}`}
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
