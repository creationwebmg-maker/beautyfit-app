import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { 
  User,
  Play, 
  ChevronRight
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const isAuthenticated = !!token;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#D2DDE7]" style={{ background: '#F7F5F2' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left spacer */}
            <div className="w-16" />

            {/* Center - Logo */}
            <div className="flex flex-col items-center">
              <img 
                src="https://customer-assets.emergentagent.com/job_amelcoach/artifacts/fru1zare_BEAUTYFIT.png" 
                alt="Beauty Fit by Amel" 
                className="h-16 w-16 md:h-20 md:w-20 object-contain"
              />
            </div>

            {/* Right side - User icon */}
            <div className="flex items-center justify-end w-16">
              <Button variant="ghost" size="icon" className="hover:bg-[#D5A0A8]/20" onClick={() => navigate(isAuthenticated ? "/account" : "/login")}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#D5A0A8' }}>
                  <User className="w-5 h-5 text-white" />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden" data-testid="hero-banner">
        <div className="absolute inset-0">
          <img 
            src="https://customer-assets.emergentagent.com/job_amelcoach/artifacts/re8f9wte_IMG_7767.jpeg"
            alt="Fitness coaching"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#E37E7F]/30 via-transparent to-[#D5A0A8]/60" />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-end text-center px-6 pb-12">
          <h1 
            className="text-3xl md:text-5xl font-bold text-white leading-tight mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Beauty Fit by Amel
          </h1>
          <p className="text-white/90 text-lg mb-4">Ton coach fitness personnel</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Programme Marche Poussette - Featured */}
        <Card 
          className="overflow-hidden cursor-pointer group border-0 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #D5A0A8, #E37E7F)' }}
          onClick={() => navigate("/programme/marche-poussette")}
          data-testid="programme-marche-poussette"
        >
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="relative md:w-2/5 aspect-video md:aspect-auto min-h-[200px]">
                <img 
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80"
                  alt="Programme Marche Poussette"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#D5A0A8]/80 hidden md:block" />
                <div className="absolute top-4 left-4 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg" style={{ background: '#EE9F80' }}>
                  GRATUIT
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-center text-white">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">👶</span>
                  <span className="bg-white/20 backdrop-blur-sm text-sm px-4 py-1.5 rounded-full">Post-partum</span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Programme Marche Poussette
                </h2>
                
                <p className="text-white/90 text-base mb-5 leading-relaxed">
                  Un programme de 9 mois spécialement conçu pour les jeunes mamans. 
                  Reprends une activité physique en douceur avec ton bébé.
                </p>
                
                <div className="flex flex-wrap gap-3 text-sm mb-6">
                  <span className="bg-white/20 px-4 py-2 rounded-full flex items-center gap-2">
                    ⏱️ 25-60 min par séance
                  </span>
                  <span className="bg-white/20 px-4 py-2 rounded-full flex items-center gap-2">
                    📳 Vibrations pour les pas
                  </span>
                  <span className="bg-white/20 px-4 py-2 rounded-full flex items-center gap-2">
                    🎯 Timer intégré
                  </span>
                </div>
                
                <Button
                  className="rounded-full font-bold px-8 py-6 w-fit text-lg text-[#E37E7F] hover:scale-105 transition-transform"
                  style={{ background: 'white' }}
                  onClick={(e) => { e.stopPropagation(); navigate("/programme/marche-poussette"); }}
                  data-testid="start-programme-btn"
                >
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Commencer maintenant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
            <CardContent className="p-5 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: '#D5A0A8' }}>
                <span className="text-2xl">🚶‍♀️</span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Marche Active</h3>
              <p className="text-sm text-muted-foreground">Compteur de pas intelligent avec vibrations</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
            <CardContent className="p-5 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: '#EE9F80' }}>
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Timer Guidé</h3>
              <p className="text-sm text-muted-foreground">Séances de 25 à 60 minutes adaptées</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
            <CardContent className="p-5 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: '#E37E7F' }}>
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">9 Mois</h3>
              <p className="text-sm text-muted-foreground">Programme progressif post-partum</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA for non-authenticated users */}
        {!isAuthenticated && (
          <Card className="bg-[#F7F5F2] border-[#D2DDE7]">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Rejoins Beauty Fit by Amel
              </h3>
              <p className="text-muted-foreground mb-4">
                Crée ton compte pour suivre ta progression
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => navigate("/register")} 
                  className="rounded-full"
                  style={{ background: '#EE9F80' }}
                >
                  Créer mon compte gratuit
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <Button variant="outline" onClick={() => navigate("/login")} className="rounded-full">
                  J'ai déjà un compte
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-foreground/5 border-t border-border/50 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_amelcoach/artifacts/fru1zare_BEAUTYFIT.png" 
              alt="Beauty Fit by Amel" 
              className="h-12 w-12 object-contain"
            />
            <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
              <button onClick={() => navigate("/mentions-legales")} className="hover:text-foreground transition-colors">Mentions légales</button>
              <span>•</span>
              <button onClick={() => navigate("/confidentialite")} className="hover:text-foreground transition-colors">Confidentialité</button>
              <span>•</span>
              <button onClick={() => navigate("/conditions-generales")} className="hover:text-foreground transition-colors">CGU</button>
              <span>•</span>
              <button onClick={() => navigate("/remboursement")} className="hover:text-foreground transition-colors">Remboursement</button>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2025 Beauty Fit by Amel. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
