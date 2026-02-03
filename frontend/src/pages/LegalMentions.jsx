import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

const LegalMentions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold ml-2">Mentions Légales</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        <Card className="border-border/50">
          <CardContent className="p-6 md:p-8 prose prose-sm max-w-none">
            <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Mentions Légales
            </h1>
            
            <p className="text-sm text-muted-foreground mb-6">
              Dernière mise à jour : Février 2025
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">1. Éditeur de l'application</h2>
            <p>L'application <strong>Beauty Fit by Amel</strong> est éditée par :</p>
            <ul className="list-none pl-0 space-y-1">
              <li><strong>Nom :</strong> JARDAZI SAYARI AMEL</li>
              <li><strong>Statut :</strong> Entrepreneur Individuel</li>
              <li><strong>SIREN :</strong> 851 371 039</li>
              <li><strong>SIRET :</strong> 851 371 039 00013</li>
              <li><strong>Numéro de TVA :</strong> FR18851371039</li>
              <li><strong>Adresse :</strong> 265 Avenue de Grasse, 06400 Cannes, France</li>
              <li><strong>Activité :</strong> Autres activités récréatives et de loisirs (Code NAF : 93.29Z)</li>
              <li><strong>Date de création :</strong> 04 juin 2019</li>
              <li><strong>Inscription RNE :</strong> Inscrit depuis le 04/06/2019</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. Directrice de la publication</h2>
            <p>
              <strong>Amel JARDAZI SAYARI</strong><br />
              En qualité de Chef d'entreprise
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. Hébergement</h2>
            <p>L'application et ses données sont hébergées par :</p>
            <ul className="list-none pl-0 space-y-1">
              <li><strong>Hébergeur :</strong> Emergent Labs</li>
              <li><strong>Localisation des serveurs :</strong> Union Européenne</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus présents sur l'application Beauty Fit by Amel, incluant, de façon non limitative, 
              les textes, images, vidéos, graphismes, logos, icônes, sons, ainsi que leur mise en forme, sont la propriété 
              exclusive de JARDAZI SAYARI AMEL, à l'exception des marques, logos ou contenus appartenant à d'autres 
              sociétés partenaires ou auteurs.
            </p>
            <p>
              Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle, 
              de ces différents éléments est strictement interdite sans l'accord exprès par écrit de JARDAZI SAYARI AMEL.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. Crédits</h2>
            <p>
              <strong>Conception et développement :</strong> Beauty Fit by Amel<br />
              <strong>Photographies :</strong> © Unsplash, © Beauty Fit by Amel
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Contact</h2>
            <p>
              Pour toute question concernant l'application, vous pouvez nous contacter :<br />
              <strong>Adresse :</strong> 265 Avenue de Grasse, 06400 Cannes, France
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LegalMentions;
