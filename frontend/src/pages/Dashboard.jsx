import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api, formatPrice, formatDuration, getLevelColor } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Play, 
  Clock, 
  Dumbbell, 
  Bell, 
  ChevronRight,
  Sparkles,
  Calendar
} from "lucide-react";
import Layout from "@/components/Layout";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [allCourses, userCourses] = await Promise.all([
        api.get("/courses"),
        api.get("/user/courses", token)
      ]);
      setCourses(allCourses.slice(0, 3));
      setPurchasedCourses(userCourses);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const motivationalMessages = [
    "Prête pour ta séance aujourd'hui ?",
    "C'est le moment de te dépasser !",
    "Ta motivation est ta force !",
    "Chaque séance te rapproche de ton objectif !",
  ];

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  return (
    <Layout>
      <div className="space-y-8" data-testid="dashboard">
        {/* Welcome Section */}
        <div className="bg-secondary/30 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 
                className="text-3xl md:text-4xl font-bold text-foreground mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
                data-testid="welcome-message"
              >
                {getGreeting()} {user?.first_name} 🌸
              </h1>
              <p className="text-lg text-muted-foreground font-handwritten">
                {randomMessage}
              </p>
            </div>
            <Button
              onClick={() => navigate("/courses")}
              className="h-12 px-8 rounded-full bg-foreground text-background hover:bg-foreground/90"
              data-testid="start-training-btn"
            >
              <Dumbbell className="w-5 h-5 mr-2" />
              Commencer un entraînement
            </Button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="md:col-span-8 space-y-6">
            {/* Purchased Courses */}
            {purchasedCourses.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 
                    className="text-2xl font-semibold text-foreground"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Mes cours
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/account")}
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="view-all-courses-btn"
                  >
                    Voir tout
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {purchasedCourses.slice(0, 2).map((course) => (
                    <Card 
                      key={course.id}
                      className="group cursor-pointer hover:border-accent/50 transition-all hover:-translate-y-1 hover:shadow-lg"
                      onClick={() => navigate(`/watch/${course.id}`)}
                      data-testid={`purchased-course-${course.id}`}
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-video">
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-cover rounded-t-xl"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-t-xl">
                            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                              <Play className="w-6 h-6 text-foreground fill-foreground" />
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDuration(course.duration_minutes)}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${getLevelColor(course.level)}`}>
                              {course.level}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Courses */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 
                  className="text-2xl font-semibold text-foreground"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Cours recommandés
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/courses")}
                  className="text-muted-foreground hover:text-foreground"
                  data-testid="explore-courses-btn"
                >
                  Explorer
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="aspect-[4/5] rounded-xl bg-muted animate-pulse" />
                  ))
                ) : (
                  courses.map((course) => (
                    <Card 
                      key={course.id}
                      className="group cursor-pointer hover:border-accent/50 transition-all hover:-translate-y-1 hover:shadow-lg"
                      onClick={() => navigate(`/courses/${course.id}`)}
                      data-testid={`recommended-course-${course.id}`}
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-video">
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-cover rounded-t-xl"
                          />
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 rounded-full bg-black/60 text-white text-xs">
                              {formatPrice(course.price)}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">
                            {course.category}
                          </span>
                          <h3 className="font-semibold text-foreground mt-1 mb-2">{course.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDuration(course.duration_minutes)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-4 space-y-6">
            {/* Motivation Card */}
            <Card className="bg-accent/20 border-accent/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent/50 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 
                    className="text-lg font-semibold text-foreground"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Motivation du jour
                  </h3>
                </div>
                <p className="text-foreground/80 font-handwritten text-xl leading-relaxed">
                  "Chaque séance est un pas vers la meilleure version de toi-même. Tu es capable de tout !"
                </p>
                <p className="text-right text-sm text-muted-foreground mt-3">— Amel</p>
              </CardContent>
            </Card>

            {/* Reminder Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <Bell className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 
                    className="text-lg font-semibold text-foreground"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Rappels
                  </h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Configure tes rappels pour ne jamais manquer une séance
                </p>
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => navigate("/settings")}
                  data-testid="configure-reminders-btn"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Configurer mes rappels
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 
                  className="text-lg font-semibold text-foreground mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Mon activité
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Cours achetés</span>
                    <span className="font-semibold text-foreground">{purchasedCourses.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Temps total</span>
                    <span className="font-semibold text-foreground">
                      {formatDuration(purchasedCourses.reduce((acc, c) => acc + c.duration_minutes, 0))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
