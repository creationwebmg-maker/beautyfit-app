import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const API_URL = process.env.REACT_APP_BACKEND_URL;

export const api = {
  get: async (endpoint, token = null) => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/api${endpoint}`, { headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const message = translateError(error.detail);
      throw new Error(message);
    }
    return response.json();
  },
  
  post: async (endpoint, data, token = null) => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const message = translateError(error.detail);
      throw new Error(message);
    }
    return response.json();
  },
  
  put: async (endpoint, data, token = null) => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const message = translateError(error.detail);
      throw new Error(message);
    }
    return response.json();
  },
  
  delete: async (endpoint, token = null) => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: "DELETE",
      headers,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const message = translateError(error.detail);
      throw new Error(message);
    }
    return response.json();
  },
};

// Translate common API errors to French
const translateError = (detail) => {
  if (!detail) return "Une erreur est survenue";
  
  const translations = {
    "Invalid credentials": "Email ou mot de passe incorrect",
    "Invalid token": "Session expirée, veuillez vous reconnecter",
    "Token expired": "Session expirée, veuillez vous reconnecter",
    "User not found": "Utilisateur non trouvé",
    "Email already registered": "Cet email est déjà utilisé",
    "Course not found": "Programme non trouvé",
    "Course already purchased": "Vous avez déjà acheté ce programme",
    "Request failed": "La requête a échoué",
  };
  
  return translations[detail] || detail;
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

export const getLevelColor = (level) => {
  switch (level?.toLowerCase()) {
    case "débutant":
      return "bg-green-100 text-green-800";
    case "intermédiaire":
      return "bg-amber-100 text-amber-800";
    case "avancé":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getCategoryIcon = (category) => {
  const icons = {
    cardio: "Heart",
    abdos: "Target",
    "full body": "Dumbbell",
    yoga: "Leaf",
    renforcement: "Zap",
  };
  return icons[category?.toLowerCase()] || "Play";
};
