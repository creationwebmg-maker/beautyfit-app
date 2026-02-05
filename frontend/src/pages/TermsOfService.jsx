import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

const TermsOfService = () => {
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
            <h1 className="text-lg font-semibold ml-2">Conditions Générales</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        <Card className="border-border/50">
          <CardContent className="p-6 md:p-8 prose prose-sm max-w-none">
            <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Conditions Générales d'Utilisation et de Vente
            </h1>
            
            <p className="text-sm text-muted-foreground mb-6">
              Dernière mise à jour : Février 2025
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Article 1 - Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation et de Vente (ci-après "CGU/CGV") régissent 
              l'utilisation de l'application mobile et web <strong>Beautyfit By Amel</strong> (ci-après "l'Application") 
              et les achats de contenus numériques (programmes sportifs, vidéos) effectués via celle-ci.
            </p>
            <p>
              L'Application est éditée par JARDAZI SAYARI AMEL, entrepreneur individuel, SIREN 851 371 039, 
              dont le siège est situé 265 Avenue de Grasse, 06400 Cannes, France.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Article 2 - Acceptation des conditions</h2>
            <p>
              L'utilisation de l'Application implique l'acceptation pleine et entière des présentes CGU/CGV. 
              En créant un compte ou en effectuant un achat, vous reconnaissez avoir lu, compris et accepté 
              l'intégralité des présentes conditions.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Article 3 - Inscription et compte utilisateur</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">3.1 Création de compte</h3>
            <p>
              L'accès à certaines fonctionnalités nécessite la création d'un compte. Vous vous engagez à 
              fournir des informations exactes et à jour, et à maintenir la confidentialité de vos identifiants.
            </p>
            <h3 className="text-lg font-medium mt-4 mb-2">3.2 Responsabilité du compte</h3>
            <p>
              Vous êtes responsable de toute activité sur votre compte. En cas d'utilisation non autorisée, 
              vous devez nous en informer immédiatement.
            </p>
            <h3 className="text-lg font-medium mt-4 mb-2">3.3 Âge minimum</h3>
            <p>
              L'Application est destinée aux personnes âgées de 16 ans minimum. Les mineurs de moins de 18 ans 
              doivent obtenir l'autorisation parentale pour effectuer des achats.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Article 4 - Services proposés</h2>
            <p>L'Application propose :</p>
            <ul>
              <li>Des programmes d'entraînement sportif sous forme de vidéos</li>
              <li>Des conseils en nutrition et bien-être</li>
              <li>Un suivi de progression personnalisé</li>
              <li>Des événements et activités en groupe</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">Article 5 - Tarifs et paiement</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">5.1 Prix</h3>
            <p>
              Les prix sont indiqués en euros (€) TTC. JARDAZI SAYARI AMEL n'est pas assujettie à la TVA 
              (franchise en base de TVA - article 293 B du CGI).
            </p>
            <h3 className="text-lg font-medium mt-4 mb-2">5.2 Modalités de paiement</h3>
            <p>
              Le paiement s'effectue par carte bancaire via nos prestataires sécurisés (Stripe, PayPal). 
              Le paiement est exigible immédiatement à la commande.
            </p>
            <h3 className="text-lg font-medium mt-4 mb-2">5.3 Sécurité des paiements</h3>
            <p>
              Les transactions sont sécurisées par cryptage SSL. Nous ne stockons pas vos données bancaires.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Article 6 - Accès aux contenus</h2>
            <p>
              Une fois le paiement validé, vous bénéficiez d'un accès illimité dans le temps aux contenus achetés, 
              accessible depuis votre compte utilisateur, tant que l'Application reste en service.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Article 7 - Droit de rétractation</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">7.1 Contenus numériques</h3>
            <p>
              Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être 
              exercé pour les contenus numériques fournis sur un support immatériel dont l'exécution a commencé 
              avec votre accord préalable et votre reconnaissance expresse de la perte du droit de rétractation.
            </p>
            <h3 className="text-lg font-medium mt-4 mb-2">7.2 Événements</h3>
            <p>
              Pour les événements (randonnées, bootcamps), vous disposez d'un délai de 14 jours pour exercer 
              votre droit de rétractation, sauf si l'événement a lieu dans ce délai, auquel cas le droit de 
              rétractation expire à la date de l'événement.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Article 8 - Politique de remboursement</h2>
            <p>
              En cas de problème technique empêchant l'accès aux contenus achetés et non résolu par notre 
              support technique, un remboursement pourra être accordé au cas par cas.
            </p>
            <p>
              Les demandes de remboursement doivent être adressées dans un délai de 30 jours suivant l'achat.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Article 9 - Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus de l'Application (vidéos, textes, images, logos, programmes) sont protégés 
              par le droit de la propriété intellectuelle et sont la propriété exclusive de JARDAZI SAYARI AMEL.
            </p>
            <p>
              L'achat d'un programme vous confère un droit d'usage personnel et non cessible. Toute reproduction, 
              diffusion, partage ou revente des contenus est strictement interdite.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Article 10 - Responsabilité</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">10.1 Avertissement santé</h3>
            <p>
              Les programmes sportifs proposés sont à titre informatif et ne remplacent pas un avis médical. 
              Consultez un médecin avant de commencer tout programme d'exercice physique.
            </p>
            <h3 className="text-lg font-medium mt-4 mb-2">10.2 Limitation de responsabilité</h3>
            <p>
              JARDAZI SAYARI AMEL ne pourra être tenue responsable des dommages directs ou indirects résultant 
              de l'utilisation de l'Application, notamment en cas de blessure lors de la pratique des exercices.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Article 11 - Disponibilité de l'Application</h2>
            <p>
              Nous nous efforçons d'assurer la disponibilité de l'Application 24h/24 et 7j/7. Cependant, 
              des interruptions pour maintenance ou mise à jour peuvent survenir sans préavis.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Article 12 - Résiliation</h2>
            <p>
              Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'Application. 
              La suppression du compte n'ouvre droit à aucun remboursement des contenus achetés.
            </p>
            <p>
              Nous nous réservons le droit de suspendre ou supprimer un compte en cas de violation des 
              présentes conditions.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Article 13 - Modification des conditions</h2>
            <p>
              Nous nous réservons le droit de modifier les présentes CGU/CGV à tout moment. Les modifications 
              entrent en vigueur dès leur publication. L'utilisation continue de l'Application vaut acceptation 
              des nouvelles conditions.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Article 14 - Droit applicable et litiges</h2>
            <p>
              Les présentes conditions sont régies par le droit français. En cas de litige, une solution 
              amiable sera recherchée avant toute action judiciaire.
            </p>
            <p>
              Conformément aux dispositions du Code de la consommation, vous pouvez recourir gratuitement 
              au service de médiation MEDICYS : <a href="https://www.medicys.fr" className="text-primary hover:underline">www.medicys.fr</a>
            </p>
            <p>
              À défaut de résolution amiable, les tribunaux français seront seuls compétents.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Article 15 - Contact</h2>
            <p>
              Pour toute question relative aux présentes conditions :<br />
              <strong>JARDAZI SAYARI AMEL</strong><br />
              265 Avenue de Grasse, 06400 Cannes, France
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TermsOfService;
