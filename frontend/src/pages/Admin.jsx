import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { 
  Lock, 
  Plus, 
  Pencil, 
  Trash2, 
  Upload,
  Video,
  Image,
  Loader2,
  LogOut,
  Play,
  Clock
} from "lucide-react";
import { formatPrice, formatDuration } from "@/lib/utils";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState(null);
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    duration_minutes: "",
    level: "",
    price: "",
    video_url: "",
    teaser_url: "",
    thumbnail_url: "",
  });

  const [files, setFiles] = useState({
    video: null,
    teaser: null,
    thumbnail: null,
  });

  const categories = ["Cardio", "Abdos", "Full Body", "Yoga", "Renforcement", "HIIT", "Stretching"];
  const levels = ["Débutant", "Intermédiaire", "Avancé"];

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setAdminToken(token);
      setIsAuthenticated(true);
      fetchCourses(token);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      if (!response.ok) {
        throw new Error("Mot de passe incorrect");
      }
      
      const data = await response.json();
      setAdminToken(data.access_token);
      localStorage.setItem("admin_token", data.access_token);
      setIsAuthenticated(true);
      toast.success("Connexion admin réussie");
      fetchCourses(data.access_token);
    } catch (error) {
      toast.error(error.message || "Erreur de connexion");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("admin_token");
    toast.success("Déconnexion réussie");
  };

  const fetchCourses = async (token) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      duration_minutes: "",
      level: "",
      price: "",
      video_url: "",
      teaser_url: "",
      thumbnail_url: "",
    });
    setFiles({ video: null, teaser: null, thumbnail: null });
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("duration_minutes", formData.duration_minutes);
      formDataToSend.append("level", formData.level);
      formDataToSend.append("price", formData.price);
      
      if (files.video) {
        formDataToSend.append("video", files.video);
      } else if (formData.video_url) {
        formDataToSend.append("video_url", formData.video_url);
      }
      
      if (files.teaser) {
        formDataToSend.append("teaser", files.teaser);
      } else if (formData.teaser_url) {
        formDataToSend.append("teaser_url", formData.teaser_url);
      }
      
      if (files.thumbnail) {
        formDataToSend.append("thumbnail", files.thumbnail);
      } else if (formData.thumbnail_url) {
        formDataToSend.append("thumbnail_url", formData.thumbnail_url);
      }

      const response = await fetch(`${API_URL}/api/admin/courses`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création");
      }

      toast.success("Cours créé avec succès !");
      setShowAddDialog(false);
      resetForm();
      fetchCourses(adminToken);
    } catch (error) {
      toast.error(error.message || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/api/admin/courses/${selectedCourse.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: formData.title || undefined,
          description: formData.description || undefined,
          category: formData.category || undefined,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined,
          level: formData.level || undefined,
          price: formData.price ? parseFloat(formData.price) : undefined,
          video_url: formData.video_url || undefined,
          teaser_url: formData.teaser_url || undefined,
          thumbnail_url: formData.thumbnail_url || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la modification");
      }

      toast.success("Cours modifié avec succès !");
      setShowEditDialog(false);
      resetForm();
      setSelectedCourse(null);
      fetchCourses(adminToken);
    } catch (error) {
      toast.error(error.message || "Erreur lors de la modification");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/courses/${selectedCourse.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      toast.success("Cours supprimé avec succès !");
      setShowDeleteDialog(false);
      setSelectedCourse(null);
      fetchCourses(adminToken);
    } catch (error) {
      toast.error(error.message || "Erreur lors de la suppression");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      duration_minutes: course.duration_minutes.toString(),
      level: course.level,
      price: course.price.toString(),
      video_url: course.video_url || "",
      teaser_url: course.teaser_url || "",
      thumbnail_url: course.thumbnail_url || "",
    });
    setShowEditDialog(true);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Toaster position="top-right" richColors />
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-accent/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-foreground" />
            </div>
            <CardTitle 
              className="text-2xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Administration
            </CardTitle>
            <p className="text-muted-foreground">Amel Fit Coach</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe admin</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12"
                  required
                  data-testid="admin-password-input"
                />
              </div>
              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full h-12 rounded-full bg-foreground text-background"
                data-testid="admin-login-btn"
              >
                {loginLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="w-full mt-4"
            >
              Retour au site
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Administration
            </h1>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="rounded-full"
              >
                Voir le site
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                data-testid="admin-logout-btn"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total cours</p>
              <p className="text-3xl font-bold text-foreground">{courses.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Catégories</p>
              <p className="text-3xl font-bold text-foreground">
                {[...new Set(courses.map(c => c.category))].length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Revenu potentiel</p>
              <p className="text-3xl font-bold text-foreground">
                {formatPrice(courses.reduce((sum, c) => sum + c.price, 0))}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Courses Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 
            className="text-2xl font-semibold text-foreground"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Gestion des cours
          </h2>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button
                className="rounded-full bg-foreground text-background"
                onClick={() => resetForm()}
                data-testid="add-course-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un cours
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau cours</DialogTitle>
                <DialogDescription>
                  Remplis les informations du cours et ajoute les vidéos
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCourse} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Titre *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Cardio Brûle-Graisses"
                      required
                      data-testid="course-title-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
                    >
                      <SelectTrigger data-testid="course-category-select">
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description du cours..."
                    rows={3}
                    required
                    data-testid="course-description-input"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Durée (min) *</Label>
                    <Input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                      placeholder="30"
                      required
                      data-testid="course-duration-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Niveau *</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => setFormData({ ...formData, level: value })}
                      required
                    >
                      <SelectTrigger data-testid="course-level-select">
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((lvl) => (
                          <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prix (€) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="9.99"
                      required
                      data-testid="course-price-input"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-4">Fichiers médias</h4>
                  
                  <div className="space-y-4">
                    {/* Thumbnail */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Image de couverture
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFiles({ ...files, thumbnail: e.target.files[0] })}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground self-center">ou</span>
                        <Input
                          type="url"
                          value={formData.thumbnail_url}
                          onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                          placeholder="URL de l'image"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Video */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Vidéo complète
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setFiles({ ...files, video: e.target.files[0] })}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground self-center">ou</span>
                        <Input
                          type="url"
                          value={formData.video_url}
                          onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                          placeholder="URL de la vidéo"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Teaser */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Teaser (aperçu gratuit)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setFiles({ ...files, teaser: e.target.files[0] })}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground self-center">ou</span>
                        <Input
                          type="url"
                          value={formData.teaser_url}
                          onChange={(e) => setFormData({ ...formData, teaser_url: e.target.value })}
                          placeholder="URL du teaser"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-foreground text-background"
                    data-testid="submit-course-btn"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Créer le cours"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Courses List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Aucun cours</h3>
              <p className="text-muted-foreground">Commence par ajouter ton premier cours</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url.startsWith("/") ? `${API_URL}${course.thumbnail_url}` : course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 rounded-full bg-white/90 text-foreground text-sm font-medium">
                      {formatPrice(course.price)}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {course.category}
                      </span>
                      <h3 className="font-semibold text-foreground">{course.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatDuration(course.duration_minutes)}
                      <span className="px-2 py-0.5 rounded bg-secondary text-xs">
                        {course.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(course)}
                        data-testid={`edit-course-${course.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`delete-course-${course.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier le cours</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditCourse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Durée (min)</Label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Niveau</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((lvl) => (
                        <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prix (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>URL de la miniature</Label>
                <Input
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>URL de la vidéo</Label>
                <Input
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>URL du teaser</Label>
                <Input
                  value={formData.teaser_url}
                  onChange={(e) => setFormData({ ...formData, teaser_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-foreground text-background"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer ce cours ?</DialogTitle>
              <DialogDescription>
                Cette action est irréversible. Le cours "{selectedCourse?.title}" et ses fichiers associés seront supprimés.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCourse}
                disabled={submitting}
                data-testid="confirm-delete-btn"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Supprimer"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Admin;
