import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { 
  User,
  Play, 
  ChevronRight,
  Moon,
  Timer,
  Zap,
  Heart
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const isAuthenticated = !!token;

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10" style={{ background: 'rgba(26, 26, 46, 0.95)', backdropFilter: 'blur(10px)' }}>
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
              <Button variant="ghost" size="icon" className="hover:bg-white/10" onClick={() => navigate(isAuthenticated ? "/account" : "/login")}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500">
                  <User className="w-5 h-5 text-white" />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 px-4 overflow-hidden" data-testid="hero-banner">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Moon Animation */}
          <div className="text-8xl mb-6 animate-float">🌙</div>
          
          <h1 
            className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            ALLER BIEN,<br/>
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              MÊME À JEUN
            </span>
          </h1>
          
          <p className="text-white/70 text-lg md:text-xl mb-2">Programme Ramadan Marche</p>
          <p className="text-amber-400 font-medium">par Beauty Fit by Amel</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
        
        {/* Programme Card */}
        <Card 
          className="overflow-hidden cursor-pointer group border-0 shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #dc2626 100%)' }}
          onClick={() => navigate("/programme/ramadan")}
          data-testid="programme-ramadan"
        >
          <CardContent className="p-0">
            <div className="p-6 md:p-8 text-white relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 text-[150px] opacity-10 transform translate-x-10 -translate-y-10">
                🌙
              </div>
              
              <div className="relative">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                  <Moon className="w-4 h-4" />
                  <span className="text-sm font-semibold">PROGRAMME RAMADAN</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Marche Rapide & Fractionnés
                </h2>
                
                <p className="text-white/90 text-lg mb-6 leading-relaxed max-w-xl">
                  Un programme de 4 semaines adapté au jeûne pour rester en forme pendant le Ramadan.
                  Timer, vibrations et exercices guidés.
                </p>
                
                {/* Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                    <Timer className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-sm font-semibold">30 min</p>
                    <p className="text-xs text-white/70">par séance</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                    <span className="text-2xl block mb-1">📅</span>
                    <p className="text-sm font-semibold">4 semaines</p>
                    <p className="text-xs text-white/70">programme</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                    <Zap className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-sm font-semibold">2-3x</p>
                    <p className="text-xs text-white/70">par semaine</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                    <span className="text-2xl block mb-1">📳</span>
                    <p className="text-sm font-semibold">Vibrations</p>
                    <p className="text-xs text-white/70">guidées</p>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className="rounded-full font-bold px-8 py-6 text-lg bg-white text-orange-600 hover:bg-white/90 hover:scale-105 transition-all shadow-xl"
                  onClick={(e) => { e.stopPropagation(); navigate("/programme/ramadan"); }}
                  data-testid="start-programme-btn"
                >
                  <Play className="w-6 h-6 mr-2 fill-current" />
                  Commencer le programme
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { week: 1, title: "Remise en route", icon: "🌙", color: "from-amber-400 to-orange-500" },
            { week: 2, title: "Activation", icon: "🔥", color: "from-orange-400 to-red-500" },
            { week: 3, title: "Pic contrôlé", icon: "⚡", color: "from-red-400 to-rose-500" },
            { week: 4, title: "Fin de Ramadan", icon: "🌟", color: "from-rose-400 to-purple-500" }
          ].map((item) => (
            <Card 
              key={item.week}
              className="border-0 cursor-pointer hover:scale-105 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)' }}
              onClick={() => navigate("/programme/ramadan")}
            >
              <CardContent className="p-4 text-center">
                <span className="text-3xl block mb-2">{item.icon}</span>
                <p className="text-white/60 text-xs">Semaine {item.week}</p>
                <p className="text-white text-sm font-semibold">{item.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="border-0" style={{ background: 'rgba(251, 191, 36, 0.1)' }}>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Respect du jeûne & de la fatigue</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Ce programme est conçu pour s'adapter à ton niveau d'énergie pendant le Ramadan. 
                  Écoute ton corps et adapte l'intensité selon tes sensations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA for non-authenticated users */}
        {!isAuthenticated && (
          <Card className="border-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Rejoins Beauty Fit by Amel
              </h3>
              <p className="text-white/60 mb-4">
                Crée ton compte pour suivre ta progression
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => navigate("/register")} 
                  className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90"
                >
                  Créer mon compte gratuit
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <Button variant="outline" onClick={() => navigate("/login")} className="rounded-full border-white/20 text-white hover:bg-white/10">
                  J'ai déjà un compte
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_amelcoach/artifacts/fru1zare_BEAUTYFIT.png" 
              alt="Beauty Fit by Amel" 
              className="h-12 w-12 object-contain opacity-60"
            />
            <div className="flex flex-wrap justify-center gap-3 text-xs text-white/40">
              <button onClick={() => navigate("/mentions-legales")} className="hover:text-white/60 transition-colors">Mentions légales</button>
              <span>•</span>
              <button onClick={() => navigate("/confidentialite")} className="hover:text-white/60 transition-colors">Confidentialité</button>
              <span>•</span>
              <button onClick={() => navigate("/conditions-generales")} className="hover:text-white/60 transition-colors">CGU</button>
              <span>•</span>
              <button onClick={() => navigate("/remboursement")} className="hover:text-white/60 transition-colors">Remboursement</button>
            </div>
            <p className="text-xs text-white/30">
              © 2025 Beauty Fit by Amel. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
