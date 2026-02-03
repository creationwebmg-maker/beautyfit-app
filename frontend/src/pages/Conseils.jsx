import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { 
  Lightbulb, 
  Apple, 
  Moon, 
  Droplets, 
  Heart,
  Dumbbell,
  Clock,
  Target,
  Sparkles,
  ChevronRight
} from "lucide-react";
import Layout from "@/components/Layout";

const Conseils = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const nutritionTips = [
    {
      icon: Apple,
      title: "Mange équilibré",
      description: "Privilégie les protéines maigres, les légumes et les glucides complexes pour optimiser tes entraînements.",
      color: "bg-green-100 text-green-700"
    },
    {
      icon: Droplets,
      title: "Hydrate-toi",
      description: "Bois au moins 2L d'eau par jour. Augmente cette quantité les jours d'entraînement intense.",
      color: "bg-blue-100 text-blue-700"
    },
    {
      icon: Clock,
      title: "Timing des repas",
      description: "Mange 2-3h avant l'entraînement et une collation protéinée dans les 30min après.",
      color: "bg-orange-100 text-orange-700"
    }
  ];

  const wellnessTips = [
    {
      icon: Moon,
      title: "Dors suffisamment",
      description: "7-9h de sommeil sont essentielles pour la récupération musculaire et l'énergie.",
      color: "bg-purple-100 text-purple-700"
    },
    {
      icon: Heart,
      title: "Écoute ton corps",
      description: "Si tu ressens une douleur ou une fatigue excessive, accorde-toi du repos.",
      color: "bg-red-100 text-red-700"
    },
    {
      icon: Sparkles,
      title: "Reste positive",
      description: "Chaque séance compte, même les plus courtes. Célèbre tes progrès !",
      color: "bg-amber-100 text-amber-700"
    }
  ];

  const trainingTips = [
    {
      icon: Dumbbell,
      title: "Échauffe-toi toujours",
      description: "5-10 minutes d'échauffement préparent tes muscles et préviennent les blessures.",
      color: "bg-rose-100 text-rose-700"
    },
    {
      icon: Target,
      title: "Fixe-toi des objectifs",
      description: "Des objectifs SMART (Spécifiques, Mesurables, Atteignables, Réalistes, Temporels) te garderont motivée.",
      color: "bg-indigo-100 text-indigo-700"
    },
    {
      icon: Clock,
      title: "Régularité > Intensité",
      description: "Mieux vaut 3 séances de 20min par semaine qu'une seule séance épuisante.",
      color: "bg-teal-100 text-teal-700"
    }
  ];

  const dailyMotivation = [
    "Tu es plus forte que tu ne le penses. Chaque répétition te rapproche de ton objectif !",
    "Le plus difficile, c'est de commencer. Une fois lancée, tu ne regretteras jamais ta séance.",
    "Ton corps peut presque tout supporter. C'est ton esprit que tu dois convaincre.",
    "Les résultats ne viennent pas du jour au lendemain, mais ils viennent. Continue !",
    "Sois fière de chaque effort. Chaque goutte de sueur est un pas vers la meilleure version de toi."
  ];

  const randomMotivation = dailyMotivation[Math.floor(Math.random() * dailyMotivation.length)];

  const TipCard = ({ tip }) => (
    <Card className="border-border/50 hover:border-accent/50 transition-all hover:-translate-y-1">
      <CardContent className="p-5">
        <div className="flex gap-4">
          <div className={`w-12 h-12 rounded-xl ${tip.color} flex items-center justify-center flex-shrink-0`}>
            <tip.icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">{tip.title}</h3>
            <p className="text-sm text-muted-foreground">{tip.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-8" data-testid="conseils-page">
        {/* Header */}
        <div>
          <h1 
            className="text-4xl md:text-5xl font-bold text-foreground mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
            data-testid="conseils-title"
          >
            Conseils
          </h1>
          <p className="text-lg text-muted-foreground">
            Mes conseils pour optimiser tes résultats
          </p>
        </div>

        {/* Daily Motivation */}
        <Card className="bg-accent/20 border-accent/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 
                  className="text-lg font-semibold text-foreground mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Motivation du jour
                </h3>
                <p className="text-foreground/80 font-handwritten text-xl leading-relaxed">
                  "{randomMotivation}"
                </p>
                <p className="text-right text-sm text-muted-foreground mt-2">— Amel</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips Tabs */}
        <Tabs defaultValue="training" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1 rounded-full w-full justify-start overflow-x-auto">
            <TabsTrigger 
              value="training" 
              className="rounded-full data-[state=active]:bg-background flex-1"
              data-testid="tab-training"
            >
              <Dumbbell className="w-4 h-4 mr-2" />
              Entraînement
            </TabsTrigger>
            <TabsTrigger 
              value="nutrition" 
              className="rounded-full data-[state=active]:bg-background flex-1"
              data-testid="tab-nutrition"
            >
              <Apple className="w-4 h-4 mr-2" />
              Nutrition
            </TabsTrigger>
            <TabsTrigger 
              value="wellness" 
              className="rounded-full data-[state=active]:bg-background flex-1"
              data-testid="tab-wellness"
            >
              <Heart className="w-4 h-4 mr-2" />
              Bien-être
            </TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainingTips.map((tip, index) => (
                <TipCard key={index} tip={tip} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nutritionTips.map((tip, index) => (
                <TipCard key={index} tip={tip} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="wellness" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wellnessTips.map((tip, index) => (
                <TipCard key={index} tip={tip} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 
                  className="text-xl font-semibold text-foreground mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Prête à t'entraîner ?
                </h3>
                <p className="text-muted-foreground">
                  Applique ces conseils dans ta prochaine séance
                </p>
              </div>
              <Button
                onClick={() => navigate("/courses")}
                className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                data-testid="go-to-courses-btn"
              >
                Voir les cours
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Conseils;
