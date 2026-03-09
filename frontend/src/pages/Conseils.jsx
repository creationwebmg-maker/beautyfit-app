import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ChevronRight,
  Sun,
  Salad,
  Coffee,
  Footprints,
  Wind,
  Bed,
  Flame,
  Utensils,
  Timer
} from "lucide-react";
import Layout from "@/components/Layout";

const Conseils = () => {
  const navigate = useNavigate();
  const [expandedTip, setExpandedTip] = useState(null);

  // Conseils Nutrition enrichis
  const nutritionTips = [
    {
      icon: Apple,
      title: "Mange équilibré",
      description: "Privilégie les protéines maigres, les légumes et les glucides complexes pour optimiser tes entraînements.",
      details: "Une assiette idéale : 1/4 protéines (poulet, poisson, œufs), 1/4 glucides complexes (riz complet, patate douce), 1/2 légumes colorés. Ajoute une source de bonnes graisses (avocat, huile d'olive).",
      color: "bg-green-100 text-green-700"
    },
    {
      icon: Droplets,
      title: "Hydrate-toi bien",
      description: "Bois au moins 2L d'eau par jour. Augmente cette quantité les jours d'entraînement intense.",
      details: "Astuce : garde une bouteille d'eau toujours visible. Bois un grand verre au réveil, avant chaque repas, et pendant/après l'entraînement. L'urine claire = bonne hydratation !",
      color: "bg-blue-100 text-blue-700"
    },
    {
      icon: Clock,
      title: "Timing des repas",
      description: "Mange 2-3h avant l'entraînement et une collation protéinée dans les 30min après.",
      details: "Avant : glucides + un peu de protéines (banane + yaourt). Après : protéines + glucides pour la récupération (shake protéiné, œufs + pain complet).",
      color: "bg-orange-100 text-orange-700"
    },
    {
      icon: Salad,
      title: "Priorité aux légumes",
      description: "Les légumes apportent fibres, vitamines et minéraux essentiels à ta performance.",
      details: "Mange des légumes à chaque repas ! Crus ou cuits, variés et colorés. Les légumes verts (épinards, brocolis) sont particulièrement riches en fer et magnésium.",
      color: "bg-emerald-100 text-emerald-700"
    },
    {
      icon: Utensils,
      title: "Évite les sucres rapides",
      description: "Limite les sodas, bonbons et pâtisseries qui créent des pics de glycémie.",
      details: "Remplace par : fruits frais, dattes (avant l'effort), chocolat noir 70%, miel en petite quantité. Ces alternatives apportent de l'énergie sans les inconvénients.",
      color: "bg-amber-100 text-amber-700"
    },
    {
      icon: Coffee,
      title: "Café avec modération",
      description: "Le café peut booster ta performance, mais évite-le après 14h pour préserver ton sommeil.",
      details: "1-2 cafés par jour max. Un café 30-60min avant l'entraînement peut améliorer tes performances. Évite les boissons énergisantes trop sucrées.",
      color: "bg-yellow-100 text-yellow-700"
    }
  ];

  // Conseils Bien-être enrichis
  const wellnessTips = [
    {
      icon: Moon,
      title: "Dors suffisamment",
      description: "7-9h de sommeil sont essentielles pour la récupération musculaire et l'énergie.",
      details: "Le sommeil profond permet la libération de l'hormone de croissance (récupération musculaire). Couche-toi à heures fixes, évite les écrans 1h avant, chambre fraîche et sombre.",
      color: "bg-purple-100 text-purple-700"
    },
    {
      icon: Heart,
      title: "Écoute ton corps",
      description: "Si tu ressens une douleur ou une fatigue excessive, accorde-toi du repos.",
      details: "Différencie la douleur musculaire normale (courbatures) de la douleur articulaire ou aigüe (stop !). En cas de doute, prends un jour de repos. Mieux vaut prévenir que guérir.",
      color: "bg-red-100 text-red-700"
    },
    {
      icon: Sparkles,
      title: "Reste positive",
      description: "Chaque séance compte, même les plus courtes. Célèbre tes progrès !",
      details: "Tiens un journal de tes victoires, même petites. Photos avant/après, mesures, performances... Tu seras fière du chemin parcouru dans quelques mois !",
      color: "bg-pink-100 text-pink-700"
    },
    {
      icon: Wind,
      title: "Respire profondément",
      description: "La respiration profonde réduit le stress et améliore la récupération.",
      details: "Technique 4-7-8 : inspire 4 sec, retiens 7 sec, expire 8 sec. Pratique 3-4 cycles avant de dormir ou en cas de stress. Ça calme le système nerveux.",
      color: "bg-cyan-100 text-cyan-700"
    },
    {
      icon: Bed,
      title: "Accorde-toi des jours off",
      description: "Le repos fait partie de l'entraînement. C'est pendant le repos que le muscle se construit.",
      details: "Planifie 1-2 jours de repos par semaine. Journée off ≠ immobile : marche légère, étirements, yoga doux sont parfaits pour la récupération active.",
      color: "bg-indigo-100 text-indigo-700"
    },
    {
      icon: Sun,
      title: "Prends le soleil",
      description: "15-20 min de soleil par jour pour la vitamine D, essentielle à tes os et ton énergie.",
      details: "La vitamine D aide à l'absorption du calcium, renforce les os et booste l'immunité. En hiver, pense à la supplémentation après avis médical.",
      color: "bg-orange-100 text-orange-700"
    }
  ];

  // Conseils Entraînement enrichis
  const trainingTips = [
    {
      icon: Dumbbell,
      title: "Échauffe-toi toujours",
      description: "5-10 minutes d'échauffement préparent tes muscles et préviennent les blessures.",
      details: "Échauffement idéal : 2-3 min de cardio léger (marche rapide, montées de genoux), puis mouvements articulaires (rotations épaules, hanches), et quelques répétitions légères des exercices prévus.",
      color: "bg-rose-100 text-rose-700"
    },
    {
      icon: Target,
      title: "Fixe-toi des objectifs",
      description: "Des objectifs SMART te garderont motivée : Spécifiques, Mesurables, Atteignables, Réalistes, Temporels.",
      details: "Exemple : 'Je veux marcher 30min, 3x/semaine pendant 4 semaines' plutôt que 'Je veux être en forme'. Note tes objectifs et coche-les quand atteints !",
      color: "bg-indigo-100 text-indigo-700"
    },
    {
      icon: Timer,
      title: "Régularité > Intensité",
      description: "Mieux vaut 3 séances de 20min par semaine qu'une seule séance épuisante.",
      details: "La constance crée l'habitude, l'habitude crée les résultats. Commence petit, augmente progressivement. Dans 3 mois, tu seras capable de bien plus !",
      color: "bg-teal-100 text-teal-700"
    },
    {
      icon: Footprints,
      title: "La marche, c'est du sport !",
      description: "30 minutes de marche rapide brûlent 150-200 calories et renforcent le cœur.",
      details: "La marche est l'exercice le plus sous-estimé. Elle sollicite 200 muscles, améliore l'humeur, et peut se pratiquer partout. Vise 8000-10000 pas par jour.",
      color: "bg-green-100 text-green-700"
    },
    {
      icon: Flame,
      title: "Varie tes entraînements",
      description: "Alterne cardio, renforcement et étirements pour des résultats complets.",
      details: "Exemple de semaine : Lundi (marche rapide), Mercredi (renforcement), Vendredi (marche + étirements). Le corps s'adapte, il faut le surprendre !",
      color: "bg-red-100 text-red-700"
    },
    {
      icon: Clock,
      title: "N'oublie pas les étirements",
      description: "5-10 min d'étirements après l'effort réduisent les courbatures et améliorent la souplesse.",
      details: "Maintiens chaque étirement 20-30 sec sans rebondir. Concentre-toi sur les muscles travaillés. Les étirements aident aussi à la relaxation mentale.",
      color: "bg-violet-100 text-violet-700"
    }
  ];

  // NOUVEAU : Conseils Ramadan
  const ramadanTips = [
    {
      icon: Moon,
      title: "Entraîne-toi au bon moment",
      description: "Privilégie l'entraînement 1h avant l'iftar ou 2-3h après pour avoir de l'énergie.",
      details: "Avant l'iftar : séance légère à modérée (marche). Après l'iftar : attends la digestion (2-3h) pour une séance plus intense. Évite l'entraînement en pleine journée à jeun.",
      color: "bg-indigo-100 text-indigo-700"
    },
    {
      icon: Droplets,
      title: "Hydratation maximale",
      description: "Bois 2-3L d'eau entre l'iftar et le suhoor pour compenser le jeûne.",
      details: "Astuce : un verre toutes les 30 min entre iftar et suhoor. Évite les boissons sucrées et gazeuses qui déshydratent. Privilégie l'eau, les infusions, et les soupes.",
      color: "bg-blue-100 text-blue-700"
    },
    {
      icon: Utensils,
      title: "Iftar équilibré",
      description: "Romps le jeûne en douceur : dattes, eau, puis un repas équilibré.",
      details: "Commence par 3 dattes + eau (tradition et glycémie). Attends 15-20 min puis mange : soupe légère, protéines, légumes, glucides complexes. Évite de te jeter sur la nourriture !",
      color: "bg-amber-100 text-amber-700"
    },
    {
      icon: Sun,
      title: "Suhoor important",
      description: "Ne saute jamais le suhoor ! C'est le carburant de ta journée.",
      details: "Suhoor idéal : glucides à index glycémique bas (avoine, pain complet), protéines (œufs, yaourt), bons gras (avocat, amandes), et beaucoup d'eau. Évite le trop salé qui donne soif.",
      color: "bg-orange-100 text-orange-700"
    },
    {
      icon: Bed,
      title: "Préserve ton sommeil",
      description: "Même avec les prières de nuit, essaie de dormir 6-7h minimum.",
      details: "Organise ton emploi du temps : sieste de 20-30 min après le travail si possible. Le manque de sommeil + jeûne = fatigue excessive et risque de blessure.",
      color: "bg-purple-100 text-purple-700"
    },
    {
      icon: Heart,
      title: "Adapte l'intensité",
      description: "Réduis l'intensité de 30-40% par rapport à tes entraînements habituels.",
      details: "Ce n'est pas le moment de battre des records ! L'objectif : maintenir ta forme, pas progresser. La marche modérée est parfaite pendant le Ramadan.",
      color: "bg-rose-100 text-rose-700"
    },
    {
      icon: Sparkles,
      title: "Écoute ton corps x2",
      description: "Pendant le Ramadan, ton corps est en mode économie. Respecte ses signaux.",
      details: "Vertiges, nausées, faiblesse excessive = STOP. Repose-toi, hydrate-toi à l'iftar. Une séance manquée n'est pas grave, ta santé passe avant tout.",
      color: "bg-pink-100 text-pink-700"
    },
    {
      icon: Target,
      title: "Objectif : maintien",
      description: "Le Ramadan n'est pas le moment pour perdre du poids de façon drastique.",
      details: "Vise le maintien de ta forme actuelle. Après le Ramadan, tu pourras reprendre tes objectifs de progression. Le jeûne est déjà un effort pour le corps !",
      color: "bg-teal-100 text-teal-700"
    }
  ];

  // Citations motivantes
  const dailyMotivation = [
    "Tu es plus forte que tu ne le penses. Chaque répétition te rapproche de ton objectif !",
    "Le plus difficile, c'est de commencer. Une fois lancée, tu ne regretteras jamais ta séance.",
    "Ton corps peut presque tout supporter. C'est ton esprit que tu dois convaincre.",
    "Les résultats ne viennent pas du jour au lendemain, mais ils viennent. Continue !",
    "Sois fière de chaque effort. Chaque goutte de sueur est un pas vers la meilleure version de toi.",
    "Ce n'est pas une question de motivation, c'est une question de discipline.",
    "Ton futur toi te remerciera d'avoir fait cette séance aujourd'hui.",
    "Le sport n'est pas une punition pour ce que tu as mangé, c'est une célébration de ce que ton corps peut faire.",
    "Peu importe ta vitesse, tu dépasses tous ceux qui restent sur le canapé.",
    "Chaque jour est une nouvelle chance de te rapprocher de tes objectifs."
  ];

  const randomMotivation = dailyMotivation[Math.floor(Math.random() * dailyMotivation.length)];

  const TipCard = ({ tip, index, category }) => {
    const isExpanded = expandedTip === `${category}-${index}`;
    
    return (
      <Card 
        className={`border-border/50 transition-all cursor-pointer ${isExpanded ? 'ring-2 ring-accent' : 'hover:border-accent/50 hover:-translate-y-1'}`}
        onClick={() => setExpandedTip(isExpanded ? null : `${category}-${index}`)}
      >
        <CardContent className="p-5">
          <div className="flex gap-4">
            <div className={`w-12 h-12 rounded-xl ${tip.color} flex items-center justify-center flex-shrink-0`}>
              <tip.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">{tip.title}</h3>
              <p className="text-sm text-muted-foreground">{tip.description}</p>
              {isExpanded && tip.details && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-sm text-foreground/80 leading-relaxed">{tip.details}</p>
                </div>
              )}
              <p className="text-xs text-accent mt-2">
                {isExpanded ? "Cliquer pour réduire" : "Cliquer pour en savoir plus"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
            Mes conseils pour optimiser tes résultats et ton bien-être
          </p>
        </div>

        {/* Daily Motivation */}
        <Card className="bg-gradient-to-r from-accent/20 to-accent/10 border-accent/30">
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
                <p className="text-foreground/80 italic text-lg leading-relaxed">
                  "{randomMotivation}"
                </p>
                <p className="text-right text-sm text-muted-foreground mt-2">— Amel, ta coach</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips Tabs */}
        <Tabs defaultValue="ramadan" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1 rounded-full w-full justify-start overflow-x-auto flex-wrap gap-1">
            <TabsTrigger 
              value="ramadan" 
              className="rounded-full data-[state=active]:bg-background"
              data-testid="tab-ramadan"
            >
              <Moon className="w-4 h-4 mr-2" />
              Ramadan
            </TabsTrigger>
            <TabsTrigger 
              value="training" 
              className="rounded-full data-[state=active]:bg-background"
              data-testid="tab-training"
            >
              <Dumbbell className="w-4 h-4 mr-2" />
              Entraînement
            </TabsTrigger>
            <TabsTrigger 
              value="nutrition" 
              className="rounded-full data-[state=active]:bg-background"
              data-testid="tab-nutrition"
            >
              <Apple className="w-4 h-4 mr-2" />
              Nutrition
            </TabsTrigger>
            <TabsTrigger 
              value="wellness" 
              className="rounded-full data-[state=active]:bg-background"
              data-testid="tab-wellness"
            >
              <Heart className="w-4 h-4 mr-2" />
              Bien-être
            </TabsTrigger>
          </TabsList>

          {/* Ramadan Tips */}
          <TabsContent value="ramadan" className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
              <p className="text-indigo-800 text-sm">
                <Moon className="w-4 h-4 inline mr-2" />
                <strong>Spécial Ramadan</strong> : Ces conseils t'aideront à maintenir ta forme tout en respectant le jeûne. L'objectif est de rester active sans te fatiguer excessivement.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ramadanTips.map((tip, index) => (
                <TipCard key={index} tip={tip} index={index} category="ramadan" />
              ))}
            </div>
          </TabsContent>

          {/* Training Tips */}
          <TabsContent value="training" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainingTips.map((tip, index) => (
                <TipCard key={index} tip={tip} index={index} category="training" />
              ))}
            </div>
          </TabsContent>

          {/* Nutrition Tips */}
          <TabsContent value="nutrition" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nutritionTips.map((tip, index) => (
                <TipCard key={index} tip={tip} index={index} category="nutrition" />
              ))}
            </div>
          </TabsContent>

          {/* Wellness Tips */}
          <TabsContent value="wellness" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wellnessTips.map((tip, index) => (
                <TipCard key={index} tip={tip} index={index} category="wellness" />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Tips Summary */}
        <Card className="bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200">
          <CardContent className="p-6">
            <h3 
              className="text-xl font-semibold text-foreground mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Les 5 règles d'or
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { icon: Droplets, text: "Bois 2L/jour", color: "text-blue-600" },
                { icon: Moon, text: "Dors 7-8h", color: "text-purple-600" },
                { icon: Footprints, text: "Bouge chaque jour", color: "text-green-600" },
                { icon: Apple, text: "Mange équilibré", color: "text-orange-600" },
                { icon: Heart, text: "Écoute ton corps", color: "text-rose-600" }
              ].map((rule, index) => (
                <div key={index} className="flex flex-col items-center text-center p-3 bg-white/50 rounded-xl">
                  <rule.icon className={`w-8 h-8 ${rule.color} mb-2`} />
                  <span className="text-sm font-medium text-foreground">{rule.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                onClick={() => navigate("/programme")}
                className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                data-testid="go-to-programme-btn"
              >
                Voir le programme
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
