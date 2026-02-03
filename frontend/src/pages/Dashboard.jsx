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
  Calendar
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayCourse, setTodayCourse] = useState(null);

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

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [allCourses, userCourses] = await Promise.all([
        api.get("/courses"),
        api.get("/user/courses", token)
      ]);
      setCourses(allCourses);
      setPurchasedCourses(userCourses);
      
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
            {/* Greeting */}
            <div>
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
            </div>

            {/* Icons */}
            <div className="flex items-center gap-2">
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        
        {/* Progress Widget */}
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

        {/* Purchased Courses / Continue Training */}
        {purchasedCourses.length > 0 && (
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
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50 md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {[
            { path: "/courses", label: "Entraînements", icon: Dumbbell, active: false },
            { path: "/conseils", label: "Conseils", icon: Target, active: false },
            { path: "/account", label: "Mon espace", icon: User, active: false },
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
