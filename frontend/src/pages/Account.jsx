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
  ChevronLeft
} from "lucide-react";
import BottomNavBar from "@/components/BottomNavBar";

const Account = () => {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    fitness_goal: user?.fitness_goal || "",
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
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [purchasesData, coursesData] = await Promise.all([
        api.get("/user/purchases", token),
        api.get("/user/courses", token)
      ]);
      setPurchases(purchasesData);
      setPurchasedCourses(coursesData);
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

  return (
    <Layout>
      <div className="space-y-8" data-testid="account-page">
        {/* Header */}
        <div>
          <h1 
            className="text-4xl md:text-5xl font-bold text-foreground mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
            data-testid="account-title"
          >
            Mon compte
          </h1>
          <p className="text-lg text-muted-foreground">
            Gère ton profil et accède à tes cours
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1 rounded-full">
            <TabsTrigger 
              value="profile" 
              className="rounded-full data-[state=active]:bg-background"
              data-testid="tab-profile"
            >
              <User className="w-4 h-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger 
              value="courses" 
              className="rounded-full data-[state=active]:bg-background"
              data-testid="tab-courses"
            >
              <Play className="w-4 h-4 mr-2" />
              Mes cours
            </TabsTrigger>
            <TabsTrigger 
              value="purchases" 
              className="rounded-full data-[state=active]:bg-background"
              data-testid="tab-purchases"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Historique
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
    </Layout>
  );
};

export default Account;
