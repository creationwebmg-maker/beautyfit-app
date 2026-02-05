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
      throw new Error(await getErrorMessage(response));
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
      throw new Error(await getErrorMessage(response));
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
      throw new Error(await getErrorMessage(response));
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
      throw new Error(await getErrorMessage(response));
    }
    return response.json();
  },
};

// Helper to extract error message from response
const getErrorMessage = async (response) => {
  // Map HTTP status codes to French messages
  const statusMessages = {
    400: "Requête invalide",
    401: "Email ou mot de passe incorrect",
    403: "Accès non autorisé",
    404: "Ressource non trouvée",
    409: "Cet email est déjà utilisé",
    422: "Données invalides",
    500: "Erreur serveur",
  };
  
  // Return status-based message as primary
  return statusMessages[response.status] || "Une erreur est survenue";
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
