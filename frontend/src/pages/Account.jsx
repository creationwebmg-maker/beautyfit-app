import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { api, formatPrice, formatDuration, getLevelColor } from "@/lib/utils";
import { toast } from "sonner";
import { 
  User, 
  ShoppingBag, 
  Clock, 
  Play,
  Edit2,
  Save,
  Loader2,
  Calendar,
  LogOut,
  ChevronLeft,
  Camera,
  Phone,
  Scale,
  Target,
  Ruler,
  X
} from "lucide-react";
import BottomNavBar from "@/components/BottomNavBar";

const Account = () => {
  const navigate = useNavigate();
  const { user, token, updateUser, logout, isGuest } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    phone: "",
    height: "",
    current_weight: "",
    target_weight: "",
    fitness_goal: "",
  });

  const fitnessGoalLabels = {
    weight_loss: "Perte de poids",
    toning: "Tonification",
    fitness: "Remise en forme",
    muscle: "Prise de muscle",
    flexibility: "Souplesse",
    wellness: "Bien-être général",
  };

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        phone: user.phone || "",
        height: user.height || "",
        current_weight: user.current_weight || "",
        target_weight: user.target_weight || "",
        fitness_goal: user.fitness_goal || "",
      });
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [purchasesData, coursesData, profileData] = await Promise.all([
        api.get("/user/purchases", token),
        api.get("/user/courses", token),
        api.get("/user/profile", token).catch(() => null)
      ]);
      setPurchases(purchasesData);
      setPurchasedCourses(coursesData);
      
      if (profileData) {
        setFormData(prev => ({
          ...prev,
          first_name: profileData.first_name || prev.first_name,
          phone: profileData.phone || "",
          height: profileData.height || "",
          current_weight: profileData.current_weight || "",
          target_weight: profileData.target_weight || "",
          fitness_goal: profileData.fitness_goal || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.put("/user/profile", formData, token);
      updateUser(updated);
      setEditing(false);
      toast.success("Profil mis à jour !");
    } catch (error) {
      toast.error(error.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Déconnexion réussie");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F7F5F2' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b" style={{ background: '#F7F5F2', borderColor: '#D2DDE7' }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                Mon espace
              </h1>
              <p className="text-sm" style={{ color: '#666' }}>
                {isGuest ? "Mode invité" : user?.first_name || "Bienvenue"}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="rounded-full"
              style={{ borderColor: '#E37E7F', color: '#E37E7F' }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isGuest ? "Quitter" : "Déconnexion"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {isGuest ? (
          /* Guest Mode View */
          <div className="space-y-6">
            <Card className="border-0 shadow-md" style={{ background: 'white' }}>
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: '#D5A0A8' }}>
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-semibold mb-2" style={{ color: '#333', fontFamily: "'Playfair Display', serif" }}>
                  Mode Invité
                </h2>
                <p className="mb-6" style={{ color: '#666' }}>
                  Crée un compte pour sauvegarder ta progression et accéder à tous les avantages.
                </p>
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => navigate("/register")}
                    className="rounded-full"
                    style={{ background: '#E37E7F' }}
                  >
                    Créer mon compte
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/login")}
                    className="rounded-full"
                    style={{ borderColor: '#D5A0A8', color: '#D5A0A8' }}
                  >
                    J'ai déjà un compte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Logged In View */
          <div className="space-y-6" data-testid="account-page">
            {/* Quick Access Card - Calorie Tracker */}
            <Card 
              className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              style={{ background: 'linear-gradient(135deg, #E37E7F, #EE9F80)' }}
              onClick={() => navigate("/calories")}
              data-testid="calorie-tracker-card"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                    <Camera className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Compteur de Calories
                    </h3>
                    <p className="text-white/80 text-sm">
                      Photographiez votre repas pour calculer les calories
                    </p>
                  </div>
                  <ChevronLeft className="w-6 h-6 text-white rotate-180" />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="bg-white p-1 rounded-full shadow-sm w-full">
                <TabsTrigger 
                  value="profile" 
                  className="rounded-full flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E37E7F] data-[state=active]:to-[#EE9F80] data-[state=active]:text-white"
                  data-testid="tab-profile"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profil
                </TabsTrigger>
                <TabsTrigger 
                  value="courses" 
                  className="rounded-full flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E37E7F] data-[state=active]:to-[#EE9F80] data-[state=active]:text-white"
                  data-testid="tab-courses"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Mes cours
                </TabsTrigger>
                <TabsTrigger 
                  value="purchases" 
                  className="rounded-full flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E37E7F] data-[state=active]:to-[#EE9F80] data-[state=active]:text-white"
                  data-testid="tab-purchases"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Achats
                </TabsTrigger>
              </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 
                    className="text-xl font-semibold text-foreground"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Mes informations
                  </h2>
                  {!editing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(true)}
                      className="rounded-full"
                      data-testid="edit-profile-btn"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing(false)}
                        className="rounded-full"
                      >
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-full bg-foreground text-background"
                        data-testid="save-profile-btn"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Enregistrer
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Prénom</Label>
                      {editing ? (
                        <Input
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          className="h-12"
                          data-testid="edit-firstname-input"
                        />
                      ) : (
                        <p className="text-foreground font-medium py-3">{user?.first_name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <p className="text-foreground font-medium py-3">{user?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Objectif sportif</Label>
                    <p className="text-foreground font-medium py-3">
                      {fitnessGoalLabels[user?.fitness_goal] || "Non défini"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Membre depuis</Label>
                    <p className="text-muted-foreground py-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : purchasedCourses.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 
                    className="text-xl font-semibold text-foreground mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Aucun cours acheté
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Découvre nos cours et commence ton parcours fitness
                  </p>
                  <Button
                    onClick={() => navigate("/courses")}
                    className="rounded-full bg-foreground text-background"
                    data-testid="explore-courses-btn"
                  >
                    Explorer les cours
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedCourses.map((course) => (
                  <Card 
                    key={course.id}
                    className="group cursor-pointer border-border/50 hover:border-accent/50 transition-all hover:-translate-y-1 hover:shadow-lg"
                    onClick={() => navigate(`/watch/${course.id}`)}
                    data-testid={`my-course-${course.id}`}
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
                            <Play className="w-6 h-6 text-foreground fill-foreground ml-1" />
                          </div>
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
                          <span className={`px-2 py-0.5 rounded text-xs ${getLevelColor(course.level)}`}>
                            {course.level}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : purchases.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 
                    className="text-xl font-semibold text-foreground mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Aucun achat
                  </h3>
                  <p className="text-muted-foreground">
                    Ton historique d'achats apparaîtra ici
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/50">
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {purchases.map((purchase) => (
                      <div 
                        key={purchase.id}
                        className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                        data-testid={`purchase-${purchase.id}`}
                      >
                        <div>
                          <p className="font-medium text-foreground">{purchase.course_title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(purchase.created_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{formatPrice(purchase.amount)}</p>
                          <p className="text-xs text-green-600 uppercase">{purchase.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
          </div>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
};

export default Account;
