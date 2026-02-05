import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  Trash2,
  Mail,
  FileText,
  Loader2,
  Save
} from "lucide-react";
import Layout from "@/components/Layout";

const Settings = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    training_days: [],
    training_time: null,
  });

  const weekDays = [
    { value: "monday", label: "Lundi" },
    { value: "tuesday", label: "Mardi" },
    { value: "wednesday", label: "Mercredi" },
    { value: "thursday", label: "Jeudi" },
    { value: "friday", label: "Vendredi" },
    { value: "saturday", label: "Samedi" },
    { value: "sunday", label: "Dimanche" },
  ];

  const timeSlots = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
  ];

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    try {
      const settings = await api.get("/user/notifications", token);
      setNotificationSettings(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await api.put("/user/notifications", notificationSettings, token);
      toast.success("Paramètres de notification enregistrés !");
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDayToggle = (day) => {
    setNotificationSettings((prev) => {
      const days = prev.training_days.includes(day)
        ? prev.training_days.filter((d) => d !== day)
        : [...prev.training_days, day];
      return { ...prev, training_days: days };
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Déconnexion réussie");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete("/user/account", token);
      logout();
      navigate("/");
      toast.success("Compte supprimé avec succès");
    } catch (error) {
      toast.error(error.message || "Erreur lors de la suppression");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-3xl" data-testid="settings-page">
        {/* Header */}
        <div>
          <h1 
            className="text-4xl md:text-5xl font-bold text-foreground mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
            data-testid="settings-title"
          >
            Paramètres
          </h1>
          <p className="text-lg text-muted-foreground">
            Gère tes préférences et ton compte
          </p>
        </div>

        {/* Notifications Section */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
                <Bell className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h2 
                  className="text-xl font-semibold text-foreground"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Notifications & Rappels
                </h2>
                <p className="text-sm text-muted-foreground">Configure tes rappels d'entraînement</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Activer les notifications</Label>
                    <p className="text-sm text-muted-foreground">Reçois des rappels pour t'entraîner</p>
                  </div>
                  <Switch
                    checked={notificationSettings.enabled}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, enabled: checked })
                    }
                    data-testid="notifications-switch"
                  />
                </div>

                {notificationSettings.enabled && (
                  <>
                    {/* Training Days */}
                    <div className="space-y-3">
                      <Label className="text-base">Jours d'entraînement</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {weekDays.map((day) => (
                          <div 
                            key={day.value}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              id={day.value}
                              checked={notificationSettings.training_days.includes(day.value)}
                              onCheckedChange={() => handleDayToggle(day.value)}
                              data-testid={`day-${day.value}`}
                            />
                            <Label htmlFor={day.value} className="text-sm cursor-pointer">
                              {day.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Training Time */}
                    <div className="space-y-2">
                      <Label className="text-base">Heure de rappel</Label>
                      <Select
                        value={notificationSettings.training_time || ""}
                        onValueChange={(value) => 
                          setNotificationSettings({ ...notificationSettings, training_time: value })
                        }
                      >
                        <SelectTrigger className="w-full max-w-xs h-12" data-testid="time-select">
                          <SelectValue placeholder="Choisis une heure" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Example notification */}
                    <div className="p-4 rounded-xl bg-accent/20 border border-accent/30">
                      <p className="text-sm text-muted-foreground mb-1">Exemple de notification :</p>
                      <p className="text-foreground font-handwritten text-lg">
                        "C'est l'heure de ta séance 💪 avec Amel Fit Coach"
                      </p>
                    </div>
                  </>
                )}

                <Button
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className="rounded-full bg-foreground text-background"
                  data-testid="save-notifications-btn"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Enregistrer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h2 
                  className="text-xl font-semibold text-foreground"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Aide & Support
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-secondary/50 transition-colors text-left"
                onClick={() => window.location.href = "mailto:contact@beautyfitbyamel.com"}
                data-testid="contact-support-btn"
              >
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">Aide & Contact</span>
              </button>
              <button 
                className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-secondary/50 transition-colors text-left"
                onClick={() => navigate("/confidentialite")}
                data-testid="privacy-policy-btn"
              >
                <FileText className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">Politique de confidentialité</span>
              </button>
              <button 
                className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-secondary/50 transition-colors text-left"
                onClick={() => navigate("/conditions-generales")}
                data-testid="terms-btn"
              >
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">Conditions générales</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Shield className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h2 
                  className="text-xl font-semibold text-foreground"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Gestion du compte
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start h-12 rounded-xl"
                data-testid="logout-btn"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Se déconnecter
              </Button>

              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                    data-testid="delete-account-btn"
                  >
                    <Trash2 className="w-5 h-5 mr-3" />
                    Supprimer mon compte
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Supprimer ton compte ?</DialogTitle>
                    <DialogDescription>
                      Cette action est irréversible. Toutes tes données et achats seront supprimés définitivement.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      data-testid="confirm-delete-btn"
                    >
                      {deleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Supprimer"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
