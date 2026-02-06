/**
 * Service de notifications quotidiennes motivationnelles
 * Une citation différente par jour pour encourager les utilisatrices
 */

// Citations motivationnelles pour BeautyFit by Amel
export const MOTIVATIONAL_QUOTES = [
  // Encouragement et persévérance
  "Continue, même lentement. Ne lâche pas maintenant.",
  "Tu avances même quand personne ne le voit.",
  "Tu mérites ce temps pour ton corps.",
  "Ta discipline est un acte d'amour envers toi.",
  "Ton corps change quand tu lui fais confiance.",
  "Tu es capable, même les jours difficiles.",
  "Ce que tu ressens aujourd'hui devient ta force demain.",
  "La fatigue passe, le résultat reste.",
  "Les sensations d'aujourd'hui construisent ton équilibre de demain.",
  "La fatigue d'aujourd'hui est le repos de demain.",
  
  // Sagesse et patience
  "Celui qui suit son chemin finit par arriver.",
  "Peu mais constant vaut mieux que beaucoup puis plus rien.",
  "Avec patience et calme, on atteint ses objectifs.",
  "Le changement commence de l'intérieur.",
  "La patience d'aujourd'hui affine ton corps et apaise ton cœur.",
  "Ton intention donne du sens à chaque mouvement.",
  
  // Spécial Ramadan et nutrition
  "L'équilibre à l'iftar conditionne ton énergie du lendemain.",
  "Ramadan n'est pas un mois d'excès, mais de justesse.",
  "Un corps bien nourri jeûne mieux.",
  "Ton corps a besoin de justesse, pas d'excès.",
  "Une assiette équilibrée aide à mieux prier et bouger.",
  "Trop manger fatigue, mieux manger élève."
];

// Obtenir la citation du jour (basée sur le jour de l'année)
export function getDailyQuote() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Sélectionner une citation basée sur le jour de l'année
  const quoteIndex = dayOfYear % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[quoteIndex];
}

// Obtenir une citation aléatoire
export function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[randomIndex];
}

// Service de notification
class NotificationService {
  constructor() {
    this.permission = 'default';
    this.scheduledNotifications = [];
  }

  // Demander la permission pour les notifications
  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('Ce navigateur ne supporte pas les notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  // Afficher une notification immédiate
  showNotification(title, body, options = {}) {
    if (this.permission !== 'granted') {
      console.log('Permission de notification non accordée');
      return null;
    }

    const notification = new Notification(title, {
      body,
      icon: 'https://customer-assets.emergentagent.com/job_d0f789bc-27a2-4e1a-8509-4380495dce2a/artifacts/bxz4jtgp_BEAUTYFIT.png',
      badge: 'https://customer-assets.emergentagent.com/job_d0f789bc-27a2-4e1a-8509-4380495dce2a/artifacts/bxz4jtgp_BEAUTYFIT.png',
      tag: 'beautyfit-motivation',
      renotify: true,
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }

  // Afficher la citation motivationnelle du jour
  showDailyMotivation() {
    const quote = getDailyQuote();
    return this.showNotification('BeautyFit by Amel 💪', quote);
  }

  // Afficher un rappel d'entraînement
  showTrainingReminder() {
    const quote = getRandomQuote();
    return this.showNotification("C'est l'heure de ta séance ! 🌙", quote);
  }

  // Planifier une notification à une heure précise (simulation pour web)
  scheduleNotification(hour, minute, callback) {
    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute,
      0
    );

    // Si l'heure est déjà passée, planifier pour demain
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      callback();
      // Replanifier pour le lendemain
      this.scheduleNotification(hour, minute, callback);
    }, delay);

    this.scheduledNotifications.push(timeoutId);
    return timeoutId;
  }

  // Annuler toutes les notifications planifiées
  cancelAllScheduled() {
    this.scheduledNotifications.forEach(id => clearTimeout(id));
    this.scheduledNotifications = [];
  }

  // Planifier la notification quotidienne de motivation
  scheduleDailyMotivation(hour = 8, minute = 0) {
    return this.scheduleNotification(hour, minute, () => {
      this.showDailyMotivation();
    });
  }

  // Planifier le rappel d'entraînement
  scheduleTrainingReminder(hour, minute) {
    return this.scheduleNotification(hour, minute, () => {
      this.showTrainingReminder();
    });
  }
}

// Instance singleton
const notificationService = new NotificationService();

export default notificationService;
export { NotificationService };
