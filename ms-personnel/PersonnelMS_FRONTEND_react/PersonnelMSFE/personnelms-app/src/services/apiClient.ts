import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  baseURL: '',  // Vite proxy routes /api/* → http://localhost:5130
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const utilisateurId = localStorage.getItem('utilisateurId');
    if (utilisateurId) {
      config.headers['X-Utilisateur-Id'] = utilisateurId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      const message = data?.message || data?.title || 'Une erreur est survenue';
      
      if (status === 404) {
        toast.error(`Ressource introuvable: ${message}`);
      } else if (status === 400) {
        const errors = data?.errors;
        if (errors) {
          const msgs = Object.values(errors).flat().join(', ');
          toast.error(`Validation: ${msgs}`);
        } else {
          toast.error(`Données invalides: ${message}`);
        }
      } else if (status === 409) {
        toast.error(`Conflit: ${message}`);
      } else if (status >= 500) {
        toast.error('Erreur serveur. Veuillez réessayer.');
      }
    } else if (error.request) {
      toast.error('Impossible de contacter le serveur. Vérifiez votre connexion.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
