import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

const RefundPolicy = () => {
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
            <h1 className="text-lg font-semibold ml-2">Politique de Remboursement</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        <Card className="border-border/50">
          <CardContent className="p-6 md:p-8 prose prose-sm max-w-none">
            <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Politique de Remboursement
            </h1>
            
            <p className="text-sm text-muted-foreground mb-6">
              Dernière mise à jour : Février 2025
            </p>

            <p>
              Chez <strong>Beauty Fit by Amel</strong>, votre satisfaction est notre priorité. Cette politique 
              de remboursement décrit les conditions dans lesquelles vous pouvez demander un remboursement 
              pour les achats effectués via notre application.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">1. Programmes et contenus numériques</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">1.1 Nature des produits</h3>
            <p>
              Les programmes sportifs vendus via l'application sont des contenus numériques (vidéos, guides) 
              accessibles immédiatement après l'achat.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">1.2 Droit de rétractation</h3>
            <p>
              Conformément à l'article L221-28 du Code de la consommation français, le droit de rétractation 
              de 14 jours ne s'applique pas aux contenus numériques dont l'exécution commence immédiatement 
              avec l'accord du consommateur.
            </p>
            <p>
              En procédant à l'achat et en accédant au contenu, vous reconnaissez expressément :
            </p>
            <ul>
              <li>Demander l'exécution immédiate du contrat</li>
              <li>Renoncer à votre droit de rétractation</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">1.3 Exceptions et remboursements possibles</h3>
            <p>Un remboursement peut être accordé dans les cas suivants :</p>
            <ul>
              <li><strong>Problème technique majeur :</strong> Si un problème technique vous empêche d'accéder 
              au contenu acheté et que notre support technique ne parvient pas à le résoudre sous 7 jours.</li>
              <li><strong>Contenu non conforme :</strong> Si le contenu ne correspond pas à la description 
              fournie au moment de l'achat.</li>
              <li><strong>Double facturation :</strong> En cas de facturation erronée multiple pour un même achat.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. Événements et activités (randonnées, bootcamps)</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">2.1 Annulation par le client</h3>
            <ul>
              <li><strong>Plus de 14 jours avant l'événement :</strong> Remboursement intégral</li>
              <li><strong>Entre 7 et 14 jours avant :</strong> Remboursement de 50% ou report sur un autre événement</li>
              <li><strong>Moins de 7 jours avant :</strong> Pas de remboursement, mais possibilité de céder sa place 
              à une autre personne</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">2.2 Annulation par Beauty Fit by Amel</h3>
            <p>
              En cas d'annulation de notre part (conditions météorologiques dangereuses, force majeure, etc.), 
              vous bénéficierez au choix :
            </p>
            <ul>
              <li>D'un remboursement intégral sous 14 jours</li>
              <li>D'un report sur une date ultérieure</li>
              <li>D'un avoir du montant correspondant</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. Procédure de demande de remboursement</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">3.1 Comment faire une demande</h3>
            <p>Pour demander un remboursement :</p>
            <ol>
              <li>Contactez-nous dans les <strong>30 jours</strong> suivant votre achat</li>
              <li>Indiquez votre nom, email de compte, date et référence de l'achat</li>
              <li>Expliquez le motif de votre demande avec les preuves éventuelles (captures d'écran, etc.)</li>
            </ol>

            <h3 className="text-lg font-medium mt-4 mb-2">3.2 Traitement de la demande</h3>
            <p>
              Nous nous engageons à traiter votre demande sous <strong>5 jours ouvrés</strong> et à vous 
              informer de notre décision par email.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">3.3 Modalités de remboursement</h3>
            <p>
              Les remboursements sont effectués via le même moyen de paiement que celui utilisé lors de l'achat, 
              dans un délai de <strong>14 jours</strong> suivant l'acceptation de la demande.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Achats via l'App Store ou Google Play</h2>
            <p>
              Pour les achats effectués via l'App Store (Apple) ou le Google Play Store, les politiques de 
              remboursement de ces plateformes s'appliquent. Vous pouvez demander un remboursement directement 
              auprès de :
            </p>
            <ul>
              <li><strong>Apple :</strong> <a href="https://reportaproblem.apple.com" className="text-primary hover:underline">reportaproblem.apple.com</a></li>
              <li><strong>Google :</strong> <a href="https://play.google.com/store/account/orderhistory" className="text-primary hover:underline">play.google.com/store/account</a></li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. Litiges</h2>
            <p>
              En cas de désaccord concernant une demande de remboursement, vous pouvez recourir gratuitement 
              au médiateur de la consommation :
            </p>
            <p>
              <strong>MEDICYS</strong><br />
              <a href="https://www.medicys.fr" className="text-primary hover:underline">www.medicys.fr</a>
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Contact</h2>
            <p>
              Pour toute demande de remboursement ou question :<br />
              <strong>JARDAZI SAYARI AMEL</strong><br />
              265 Avenue de Grasse, 06400 Cannes, France
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RefundPolicy;
