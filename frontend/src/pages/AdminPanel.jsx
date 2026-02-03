import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ChevronLeft,
  Upload,
  Save,
  Image,
  Type,
  Palette,
  Eye,
  LogOut,
  Plus,
  Trash2,
  GripVertical,
  RefreshCw
} from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL || "";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("admin_token") || "");
  
  // Site content state
  const [siteContent, setSiteContent] = useState(null);
  const [heroTitle, setHeroTitle] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [heroButtonText, setHeroButtonText] = useState("");
  const [programs, setPrograms] = useState([]);
  const [colors, setColors] = useState({
    linen: "#F7F5F2",
    sky: "#D2DDE7",
    berry: "#D5A0A8",
    sunrise: "#EE9F80",
    watermelon: "#E37E7F"
  });
  const [logoUrl, setLogoUrl] = useState("");
  const [marqueeTexts, setMarqueeTexts] = useState([]);

  // Check if already authenticated
  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, []);

  const verifyToken = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/site-content`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setIsAuthenticated(true);
        loadSiteContent();
      } else {
        localStorage.removeItem("admin_token");
        setToken("");
      }
    } catch (e) {
      localStorage.removeItem("admin_token");
      setToken("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      
      if (res.ok) {
        const data = await res.json();
        setToken(data.access_token);
        localStorage.setItem("admin_token", data.access_token);
        setIsAuthenticated(true);
        loadSiteContent();
        toast.success("Connexion réussie !");
      } else {
        toast.error("Mot de passe incorrect");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    }
    setLoading(false);
  };

  const loadSiteContent = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/site-content`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSiteContent(data);
        setHeroTitle(data.hero?.title || "");
        setHeroImage(data.hero?.image_url || "");
        setHeroButtonText(data.hero?.button_text || "");
        setPrograms(data.programs || []);
        setColors(data.colors || colors);
        setLogoUrl(data.logo_url || "");
        setMarqueeTexts(data.marquee?.texts || []);
      }
    } catch (e) {
      toast.error("Erreur de chargement");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken("");
    setIsAuthenticated(false);
    toast.success("Déconnexion réussie");
  };

  const handleImageUpload = async (file, callback) => {
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch(`${API_URL}/api/admin/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        const fullUrl = `${API_URL}${data.url}`;
        callback(fullUrl);
        toast.success("Image uploadée !");
      } else {
        toast.error("Erreur d'upload");
      }
    } catch (e) {
      toast.error("Erreur d'upload");
    }
  };

  const saveHero = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/site-content/hero`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: heroTitle,
          image_url: heroImage,
          button_text: heroButtonText,
          subtitle: null
        })
      });
      
      if (res.ok) {
        toast.success("Bannière sauvegardée !");
      } else {
        toast.error("Erreur de sauvegarde");
      }
    } catch (e) {
      toast.error("Erreur de sauvegarde");
    }
    setSaving(false);
  };

  const savePrograms = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/site-content/programs`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(programs)
      });
      
      if (res.ok) {
        toast.success("Programmes sauvegardés !");
      } else {
        toast.error("Erreur de sauvegarde");
      }
    } catch (e) {
      toast.error("Erreur de sauvegarde");
    }
    setSaving(false);
  };

  const saveColors = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/site-content/colors`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(colors)
      });
      
      if (res.ok) {
        toast.success("Couleurs sauvegardées !");
      } else {
        toast.error("Erreur de sauvegarde");
      }
    } catch (e) {
      toast.error("Erreur de sauvegarde");
    }
    setSaving(false);
  };

  const addProgram = () => {
    setPrograms([
      ...programs,
      {
        id: `prog_${Date.now()}`,
        title: "Nouveau Programme",
        subtitle: "Programme",
        price: 0,
        image_url: "",
        badge: null,
        badge_icon: null,
        order: programs.length
      }
    ]);
  };

  const updateProgram = (index, field, value) => {
    const updated = [...programs];
    updated[index][field] = value;
    setPrograms(updated);
  };

  const deleteProgram = (index) => {
    const updated = programs.filter((_, i) => i !== index);
    setPrograms(updated);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F7F5F2' }}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_amelcoach/artifacts/fru1zare_BEAUTYFIT.png"
              alt="BeautyFit"
              className="h-20 w-20 mx-auto mb-4"
            />
            <CardTitle style={{ color: '#E37E7F' }}>Administration</CardTitle>
            <p className="text-sm text-muted-foreground">Panneau de gestion du site</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label>Mot de passe admin</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez le mot de passe"
                  className="mt-1"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                style={{ background: '#EE9F80' }}
                disabled={loading}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Panel
  return (
    <div className="min-h-screen" style={{ background: '#F7F5F2' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg" style={{ color: '#E37E7F' }}>Administration</h1>
              <p className="text-xs text-muted-foreground">Gestion du contenu</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open("/", "_blank")}>
              <Eye className="w-4 h-4 mr-2" />
              Voir le site
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-xl">
            <TabsTrigger value="hero" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Bannière
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Programmes
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Couleurs
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Cours
            </TabsTrigger>
          </TabsList>

          {/* Hero Tab */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" style={{ color: '#EE9F80' }} />
                  Bannière d'accueil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preview */}
                <div className="relative h-48 rounded-lg overflow-hidden bg-gray-100">
                  {heroImage && (
                    <img src={heroImage} alt="Hero preview" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#E37E7F]/30 via-transparent to-[#D5A0A8]/40" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h2 className="text-2xl font-bold">{heroTitle || "Titre de la bannière"}</h2>
                    <Button size="sm" className="mt-2" style={{ background: '#EE9F80' }}>
                      {heroButtonText || "VOIR LES PROGRAMMES"}
                    </Button>
                  </div>
                </div>

                {/* Edit Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Titre principal</Label>
                    <Input
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      placeholder="Ex: Atteins tes objectifs"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Texte du bouton</Label>
                    <Input
                      value={heroButtonText}
                      onChange={(e) => setHeroButtonText(e.target.value)}
                      placeholder="Ex: VOIR LES PROGRAMMES"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Image de fond</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={heroImage}
                      onChange={(e) => setHeroImage(e.target.value)}
                      placeholder="URL de l'image"
                      className="flex-1"
                    />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleImageUpload(e.target.files[0], setHeroImage);
                          }
                        }}
                      />
                      <Button type="button" variant="outline" asChild>
                        <span><Upload className="w-4 h-4 mr-2" />Upload</span>
                      </Button>
                    </label>
                  </div>
                </div>

                <Button onClick={saveHero} disabled={saving} style={{ background: '#EE9F80' }}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Sauvegarde..." : "Sauvegarder la bannière"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" style={{ color: '#EE9F80' }} />
                  Programmes de la page d'accueil
                </CardTitle>
                <Button onClick={addProgram} size="sm" style={{ background: '#EE9F80' }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {programs.map((program, index) => (
                  <Card key={program.id} className="border-2 border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                          <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                        </div>
                        
                        {/* Image Preview */}
                        <div className="w-24 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {program.image_url ? (
                            <img src={program.image_url} alt={program.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Fields */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Titre</Label>
                            <Input
                              value={program.title}
                              onChange={(e) => updateProgram(index, "title", e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Prix (€)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={program.price}
                              onChange={(e) => updateProgram(index, "price", parseFloat(e.target.value))}
                              className="mt-1"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-xs">Image URL</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                value={program.image_url}
                                onChange={(e) => updateProgram(index, "image_url", e.target.value)}
                                className="flex-1"
                              />
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files[0]) {
                                      handleImageUpload(e.target.files[0], (url) => updateProgram(index, "image_url", url));
                                    }
                                  }}
                                />
                                <Button type="button" variant="outline" size="sm" asChild>
                                  <span><Upload className="w-4 h-4" /></span>
                                </Button>
                              </label>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Badge (emoji)</Label>
                            <Input
                              value={program.badge || ""}
                              onChange={(e) => updateProgram(index, "badge", e.target.value)}
                              placeholder="Ex: 🌙"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteProgram(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button onClick={savePrograms} disabled={saving} style={{ background: '#EE9F80' }}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Sauvegarde..." : "Sauvegarder les programmes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" style={{ color: '#EE9F80' }} />
                  Palette de couleurs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preview */}
                <div className="flex gap-2">
                  {Object.entries(colors).map(([name, color]) => (
                    <div key={name} className="flex-1 text-center">
                      <div
                        className="h-16 rounded-lg mb-2 shadow-inner"
                        style={{ background: color }}
                      />
                      <p className="text-xs font-medium capitalize">{name}</p>
                      <p className="text-xs text-muted-foreground">{color}</p>
                    </div>
                  ))}
                </div>

                {/* Color Pickers */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(colors).map(([name, color]) => (
                    <div key={name}>
                      <Label className="capitalize">{name}</Label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColors({ ...colors, [name]: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={color}
                          onChange={(e) => setColors({ ...colors, [name]: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={saveColors} disabled={saving} style={{ background: '#EE9F80' }}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Sauvegarde..." : "Sauvegarder les couleurs"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab - Redirect to existing admin */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" style={{ color: '#EE9F80' }} />
                  Gestion des cours vidéo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Gérez vos cours vidéo payants (création, modification, suppression).
                </p>
                <Button onClick={() => navigate("/admin")} style={{ background: '#EE9F80' }}>
                  Accéder à la gestion des cours
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Refresh Button */}
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={loadSiteContent}
            size="lg"
            className="rounded-full shadow-lg"
            variant="outline"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
