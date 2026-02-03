import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Play, ChevronRight, Star, Clock, Users } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1767611114501-ee5c2ea37ee7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwzfHxoZWFsdGh5JTIwbGlmZXN0eWxlJTIwd29tYW4lMjBzdHJldGNoaW5nJTIweW9nYSUyMGJlaWdlJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzAxMDA0Mzl8MA&ixlib=rb-4.1.0&q=85"
            alt="Fitness"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className={`space-y-8 ${showContent ? 'animate-fade-in' : 'opacity-0'}`}>
              {/* Logo */}
              <div className="space-y-2">
                <h1 
                  className="text-5xl md:text-7xl font-bold tracking-tight text-foreground"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  data-testid="logo-text"
                >
                  Amel Fit Coach
                </h1>
                <p 
                  className="text-xl md:text-2xl text-muted-foreground font-handwritten"
                  data-testid="slogan"
                >
                  Ton coach, ta motivation, ton rythme.
                </p>
              </div>

              {/* Description */}
              <p className="text-lg text-foreground/70 leading-relaxed max-w-lg">
                Découvrez des cours vidéo de fitness personnalisés, accessibles où que vous soyez. 
                Transformez votre corps et votre esprit avec un accompagnement quotidien.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
                    <Play className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">50+</p>
                    <p className="text-sm text-muted-foreground">Cours vidéo</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Illimité</p>
                    <p className="text-sm text-muted-foreground">Accès 24/7</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
                    <Star className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">4.9/5</p>
                    <p className="text-sm text-muted-foreground">Satisfaction</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  data-testid="cta-start-btn"
                  onClick={() => navigate("/register")}
                  className="h-14 px-10 rounded-full text-lg font-medium bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95"
                >
                  Commencer maintenant
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  data-testid="cta-login-btn"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="h-14 px-10 rounded-full text-lg font-medium border-foreground/20 hover:bg-secondary transition-all"
                >
                  Se connecter
                </Button>
              </div>
            </div>

            {/* Coach Image */}
            <div className={`hidden md:block ${showContent ? 'animate-slide-up stagger-2' : 'opacity-0'}`}>
              <div className="relative">
                <div className="absolute -inset-4 bg-accent/20 rounded-3xl blur-2xl" />
                <img
                  src="https://images.unsplash.com/photo-1739001408867-5e2db264526b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwyfHxmZW1hbGUlMjBmaXRuZXNzJTIwY29hY2glMjBlbGVnYW50JTIwbWluaW1hbGlzdCUyMHN0dWRpb3xlbnwwfHx8fDE3NzAxMDA0MzJ8MA&ixlib=rb-4.1.0&q=85"
                  alt="Amel Fit Coach"
                  className="relative rounded-3xl shadow-2xl w-full max-w-md mx-auto"
                />
                {/* Floating card */}
                <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-2xl shadow-lg border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center">
                      <Users className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">+2000</p>
                      <p className="text-sm text-muted-foreground">Membres actifs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold text-foreground mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Pourquoi choisir Amel Fit Coach ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une expérience de coaching unique, pensée pour vous accompagner vers vos objectifs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Cours personnalisés",
                description: "Des programmes adaptés à votre niveau et vos objectifs sportifs",
                icon: "🎯"
              },
              {
                title: "Accès illimité",
                description: "Entraînez-vous quand vous voulez, où que vous soyez",
                icon: "⏰"
              },
              {
                title: "Motivation quotidienne",
                description: "Des rappels et messages personnalisés pour rester motivée",
                icon: "💪"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="p-8 rounded-2xl bg-card border border-border/50 hover:border-accent/50 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 
                  className="text-xl font-semibold text-foreground mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p 
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Amel Fit Coach
            </p>
            <p className="text-sm text-muted-foreground">
              © 2024 Amel Fit Coach. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
