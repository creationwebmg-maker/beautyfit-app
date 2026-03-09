# Guide de Configuration DNS pour Resend

## Problème Actuel
Les emails de réinitialisation de mot de passe ne sont pas envoyés car le domaine `beautyfitbyamel.fr` n'est pas encore vérifié sur Resend.

## Étapes pour Configurer le DNS

### 1. Connectez-vous à Resend
- Allez sur https://resend.com/domains
- Connectez-vous à votre compte

### 2. Ajoutez votre domaine
- Cliquez sur "Add Domain"
- Entrez: `beautyfitbyamel.fr`

### 3. Ajoutez les enregistrements DNS
Resend vous donnera des enregistrements à ajouter. Généralement:

| Type | Nom | Valeur |
|------|-----|--------|
| TXT | @ ou beautyfitbyamel.fr | resend-domain-verify=xxxxx |
| MX | send.beautyfitbyamel.fr | feedback-smtp.xx.amazonses.com |
| TXT | send.beautyfitbyamel.fr | v=spf1 include:amazonses.com ~all |

### 4. Où ajouter ces enregistrements ?
Connectez-vous à votre registrar de domaine (là où vous avez acheté beautyfitbyamel.fr):
- OVH: Manager → Domaines → beautyfitbyamel.fr → Zone DNS
- Ionos: Domaines & SSL → beautyfitbyamel.fr → DNS
- GoDaddy: My Products → Domains → DNS

### 5. Attendez la propagation
- La propagation DNS peut prendre 24-48h
- Vérifiez le statut sur Resend: https://resend.com/domains

## Alternative Temporaire
En attendant la vérification du domaine, les emails sont envoyés depuis l'adresse par défaut de Resend. Les utilisateurs recevront quand même le code de réinitialisation.

## Test après Configuration
Une fois le domaine vérifié, testez:
```bash
curl -X POST "https://beautyfit-app.onrender.com/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"votre@email.com"}'
```

## Support
Si vous avez des difficultés, Resend a une documentation complète:
https://resend.com/docs/dashboard/domains/introduction
