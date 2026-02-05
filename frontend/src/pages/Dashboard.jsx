import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import BottomNavBar from "@/components/BottomNavBar";
import { 
  User,
  Play, 
  ChevronRight,
  Moon,
  Timer,
  Zap,
  Heart,
  X
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const isAuthenticated = !!token;
  const [showNotification, setShowNotification] = useState(false);

  const motivationalQuotes = [
    "✨ Chaque pas compte vers ta meilleure version ✨",
    "💪 Le jeûne n'est pas une excuse, c'est une force 💪",
    "🌙 Ramadan Mubarak - Reste active ! 🌙",
    "⭐ Ton corps te remerciera ⭐",
    "🔥 30 minutes pour transformer ta journée 🔥"
  ];

  // Show notification after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 3000);
    
    // Auto-hide after 8 seconds
    const hideTimer = setTimeout(() => {
      setShowNotification(false);
    }, 11000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: '#F7F5F2' }}>
      {/* iOS Style Push Notification */}
      {showNotification && (
        <div className="fixed top-4 left-4 right-4 z-[100] animate-slide-down">
          <div 
            className="mx-auto max-w-md rounded-2xl p-4 shadow-2xl backdrop-blur-xl"
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(0,0,0,0.1)'
            }}
          >
            <div className="flex items-start gap-3">
              {/* App Icon */}
              <div className="flex-shrink-0">
                <img 
                  src="https://customer-assets.emergentagent.com/job_d0f789bc-27a2-4e1a-8509-4380495dce2a/artifacts/bxz4jtgp_BEAUTYFIT.png" 
                  alt="Beautyfit" 
                  className="w-12 h-12 rounded-xl object-contain"
                  style={{ background: '#F7F5F2' }}
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#E37E7F' }}>
                    BEAUTY FIT BY AMEL
                  </span>
                  <span className="text-xs" style={{ color: '#999' }}>maintenant</span>
                </div>
                <p className="mt-1 text-sm font-semibold" style={{ color: '#333' }}>
                  💪 Rappel du jour
                </p>
                <p className="mt-0.5 text-sm leading-snug" style={{ color: '#666' }}>
                  Tes courbatures d'aujourd'hui sont tes muscles de demain 🔥
                </p>
              </div>
              
              {/* Close button */}
              <button 
                onClick={() => setShowNotification(false)}
                className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors"
              >
                <X className="w-4 h-4" style={{ color: '#999' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#D2DDE7]" style={{ background: '#F7F5F2' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="w-16" />
            <div className="flex flex-col items-center">
              <img 
                src="https://customer-assets.emergentagent.com/job_d0f789bc-27a2-4e1a-8509-4380495dce2a/artifacts/bxz4jtgp_BEAUTYFIT.png" 
                alt="Beautyfit By Amel" 
                className="h-16 w-16 md:h-20 md:w-20 object-contain"
              />
            </div>
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

      {/* Hero Banner with Photo */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden" data-testid="hero-banner">
        <div className="absolute inset-0">
          <img 
            src="https://customer-assets.emergentagent.com/job_amel-management/artifacts/htjn8kqc_image.jpeg"
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
            Beautyfit By Amel
          </h1>
          <p className="text-white/90 text-lg mb-4">Ton coach fitness personnel</p>
        </div>
      </section>

      {/* Scrolling Motivational Banner */}
      <div className="overflow-hidden py-3" style={{ background: 'linear-gradient(90deg, #D5A0A8, #E37E7F, #EE9F80)' }}>
        <div className="animate-marquee whitespace-nowrap flex">
          {[...motivationalQuotes, ...motivationalQuotes, ...motivationalQuotes].map((quote, idx) => (
            <span key={idx} className="mx-8 text-white font-medium text-sm md:text-base">
              {quote}
            </span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
        
        {/* Programme Ramadan Card */}
        <Card 
          className="overflow-hidden cursor-pointer group border-0 shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
          style={{ background: 'linear-gradient(135deg, #E37E7F 0%, #D5A0A8 50%, #EE9F80 100%)' }}
          onClick={() => navigate("/programme/ramadan")}
          data-testid="programme-ramadan"
        >
          <CardContent className="p-0">
            <div className="p-6 md:p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 text-[120px] opacity-10 transform translate-x-6 -translate-y-6">
                🌙
              </div>
              
              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                  <Moon className="w-4 h-4" />
                  <span className="text-sm font-semibold">PROGRAMME RAMADAN</span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  ALLER BIEN, MÊME À JEUN
                </h2>
                
                <p className="text-lg font-medium text-white/90 mb-4">
                  Marche Rapide & Fractionnés
                </p>
                
                <p className="text-white/80 mb-6 leading-relaxed max-w-xl">
                  Un programme de 4 semaines adapté au jeûne pour rester en forme pendant le Ramadan.
                  Timer, vibrations et exercices guidés.
                </p>
                
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

                <Button
                  className="rounded-full font-bold px-8 py-6 text-lg hover:scale-105 transition-all shadow-xl"
                  style={{ background: 'white', color: '#E37E7F' }}
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
            { week: 1, title: "Remise en route", icon: "🌙", bg: "#D5A0A8" },
            { week: 2, title: "Activation", icon: "🔥", bg: "#E37E7F" },
            { week: 3, title: "Pic contrôlé", icon: "⚡", bg: "#EE9F80" },
            { week: 4, title: "Fin de Ramadan", icon: "🌟", bg: "#D5A0A8" }
          ].map((item) => (
            <Card 
              key={item.week}
              className="border-0 cursor-pointer hover:scale-105 transition-all shadow-md"
              style={{ background: 'white' }}
              onClick={() => navigate("/programme/ramadan")}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ background: item.bg }}>
                  <span className="text-xl">{item.icon}</span>
                </div>
                <p className="text-xs" style={{ color: '#666' }}>Semaine {item.week}</p>
                <p className="text-sm font-semibold" style={{ color: '#333' }}>{item.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="border-0 shadow-md" style={{ background: 'white' }}>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#D5A0A8' }}>
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: '#E37E7F' }}>Respect du jeûne & de la fatigue</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#666' }}>
                  Ce programme est conçu pour s'adapter à ton niveau d'énergie pendant le Ramadan. 
                  Écoute ton corps et adapte l'intensité selon tes sensations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA for non-authenticated users */}
        {!isAuthenticated && (
          <Card className="border shadow-md" style={{ background: 'white', borderColor: '#D2DDE7' }}>
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: '#333' }}>
                Rejoins Beautyfit By Amel
              </h3>
              <p className="mb-4" style={{ color: '#666' }}>
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
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-8" style={{ borderColor: '#D2DDE7', background: '#F7F5F2' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_d0f789bc-27a2-4e1a-8509-4380495dce2a/artifacts/bxz4jtgp_BEAUTYFIT.png" 
              alt="Beautyfit By Amel" 
              className="h-12 w-12 object-contain opacity-60"
            />
            <div className="flex flex-wrap justify-center gap-3 text-xs" style={{ color: '#999' }}>
              <button onClick={() => navigate("/mentions-legales")} className="hover:text-[#E37E7F] transition-colors">Mentions légales</button>
              <span>•</span>
              <button onClick={() => navigate("/confidentialite")} className="hover:text-[#E37E7F] transition-colors">Confidentialité</button>
              <span>•</span>
              <button onClick={() => navigate("/conditions-generales")} className="hover:text-[#E37E7F] transition-colors">CGU</button>
              <span>•</span>
              <button onClick={() => navigate("/remboursement")} className="hover:text-[#E37E7F] transition-colors">Remboursement</button>
            </div>
            <p className="text-xs" style={{ color: '#bbb' }}>
              © 2025 Beautyfit By Amel. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes slide-down {
          0% { 
            transform: translateY(-100%);
            opacity: 0;
          }
          100% { 
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Bottom Navigation Bar */}
      <BottomNavBar />
    </div>
  );
};

export default Dashboard;
