import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

const PrivacyPolicy = () => {
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
            <h1 className="text-lg font-semibold ml-2">Politique de Confidentialité</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        <Card className="border-border/50">
          <CardContent className="p-6 md:p-8 prose prose-sm max-w-none">
            <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Politique de Confidentialité
            </h1>
            
            <p className="text-sm text-muted-foreground mb-6">
              Dernière mise à jour : Février 2025
            </p>

            <p>
              La présente politique de confidentialité décrit comment JARDAZI SAYARI AMEL, entrepreneur individuel 
              (SIREN : 851 371 039), collecte, utilise et protège vos données personnelles lorsque vous utilisez 
              l'application <strong>Beautyfit By Amel</strong>.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">1. Responsable du traitement</h2>
            <p>
              <strong>JARDAZI SAYARI AMEL</strong><br />
              265 Avenue de Grasse, 06400 Cannes, France<br />
              SIREN : 851 371 039 | SIRET : 851 371 039 00013
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>
            <ul>
              <li><strong>Données d'identification :</strong> nom, prénom, adresse email</li>
              <li><strong>Données de profil :</strong> objectifs sportifs, préférences d'entraînement</li>
              <li><strong>Données d'utilisation :</strong> historique des séances, progression, activité dans l'application</li>
              <li><strong>Données de transaction :</strong> historique des achats de programmes</li>
              <li><strong>Données techniques :</strong> adresse IP, type d'appareil, système d'exploitation</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. Finalités du traitement</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul>
              <li>Créer et gérer votre compte utilisateur</li>
              <li>Fournir l'accès aux programmes et contenus achetés</li>
              <li>Personnaliser votre expérience et vos recommandations</li>
              <li>Suivre votre progression sportive</li>
              <li>Traiter vos paiements et achats</li>
              <li>Vous envoyer des notifications et communications (avec votre consentement)</li>
              <li>Améliorer nos services et développer de nouvelles fonctionnalités</li>
              <li>Assurer la sécurité de l'application</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Base légale du traitement</h2>
            <p>Le traitement de vos données repose sur :</p>
            <ul>
              <li><strong>L'exécution du contrat :</strong> pour fournir les services que vous avez achetés</li>
              <li><strong>Votre consentement :</strong> pour les communications marketing</li>
              <li><strong>Notre intérêt légitime :</strong> pour améliorer nos services et assurer la sécurité</li>
              <li><strong>Nos obligations légales :</strong> conservation des données de facturation</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. Durée de conservation</h2>
            <ul>
              <li><strong>Données de compte :</strong> conservées pendant la durée de votre inscription, puis 3 ans après suppression</li>
              <li><strong>Données de transaction :</strong> 10 ans (obligation légale comptable)</li>
              <li><strong>Données d'utilisation :</strong> 3 ans à compter de la dernière activité</li>
              <li><strong>Cookies :</strong> 13 mois maximum</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Partage des données</h2>
            <p>Vos données peuvent être partagées avec :</p>
            <ul>
              <li><strong>Prestataires de paiement :</strong> Stripe, PayPal (pour le traitement sécurisé des paiements)</li>
              <li><strong>Hébergeur :</strong> pour le stockage sécurisé des données</li>
              <li><strong>Prestataires techniques :</strong> pour l'envoi de notifications</li>
            </ul>
            <p>
              Nous ne vendons jamais vos données personnelles à des tiers. Tous nos partenaires sont soumis à des 
              obligations contractuelles de confidentialité conformes au RGPD.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">7. Transferts hors UE</h2>
            <p>
              Vos données sont principalement stockées dans l'Union Européenne. En cas de transfert vers des pays 
              tiers, nous nous assurons que des garanties appropriées sont en place (clauses contractuelles types, 
              certifications).
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">8. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
              <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
              <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              <li><strong>Droit de retirer votre consentement :</strong> à tout moment pour les traitements basés sur le consentement</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous à l'adresse : 265 Avenue de Grasse, 06400 Cannes, France.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">9. Sécurité des données</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos 
              données contre tout accès non autorisé, modification, divulgation ou destruction, notamment :
            </p>
            <ul>
              <li>Chiffrement des données en transit (HTTPS/TLS)</li>
              <li>Chiffrement des mots de passe</li>
              <li>Accès restreint aux données personnelles</li>
              <li>Surveillance et détection des intrusions</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">10. Cookies</h2>
            <p>
              L'application utilise des cookies et technologies similaires pour améliorer votre expérience. 
              Consultez notre Politique des Cookies pour plus d'informations.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">11. Mineurs</h2>
            <p>
              L'application est destinée aux personnes de 16 ans et plus. Nous ne collectons pas sciemment 
              de données concernant des mineurs de moins de 16 ans sans le consentement parental.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">12. Modifications</h2>
            <p>
              Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications 
              entrent en vigueur dès leur publication. Nous vous informerons des modifications importantes 
              par notification dans l'application.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">13. Réclamation</h2>
            <p>
              Si vous estimez que le traitement de vos données n'est pas conforme à la réglementation, 
              vous pouvez introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique 
              et des Libertés) : <a href="https://www.cnil.fr" className="text-primary hover:underline">www.cnil.fr</a>
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">14. Contact</h2>
            <p>
              Pour toute question relative à cette politique de confidentialité :<br />
              <strong>JARDAZI SAYARI AMEL</strong><br />
              265 Avenue de Grasse, 06400 Cannes, France
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
