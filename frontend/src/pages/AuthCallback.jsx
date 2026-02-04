import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { processGoogleAuth } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleCallback = async () => {
      try {
        // Get session_id from URL hash
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace('#', ''));
        const sessionId = params.get('session_id');

        if (!sessionId) {
          toast.error("Erreur d'authentification");
          navigate('/login');
          return;
        }

        // Process the Google auth
        await processGoogleAuth(sessionId);
        
        toast.success("Connexion Google réussie !");
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error("Erreur lors de la connexion Google");
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, processGoogleAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F5F2' }}>
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#E37E7F' }} />
        <p className="text-lg font-medium" style={{ color: '#333' }}>Connexion en cours...</p>
        <p className="text-sm mt-2" style={{ color: '#666' }}>Veuillez patienter</p>
      </div>
    </div>
  );
};

export default AuthCallback;
