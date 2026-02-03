import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Animation duration + delay before redirect
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2500);

    const redirectTimer = setTimeout(() => {
      navigate("/home");
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      {/* Logo with coin flip animation */}
      <div 
        className={`relative ${animationComplete ? 'animate-fade-out' : ''}`}
        style={{
          perspective: '1000px',
        }}
      >
        <div 
          className="logo-coin"
          style={{
            animation: 'coinFlip 2s ease-in-out forwards',
            transformStyle: 'preserve-3d',
          }}
        >
          <img 
            src="https://customer-assets.emergentagent.com/job_fitvid-1/artifacts/h05n68ev_Design%20sans%20titre.png" 
            alt="Beauty Fit by Amel" 
            className="w-32 h-32 md:w-40 md:h-40 object-contain"
          />
        </div>
      </div>

      {/* Brand name that appears after flip */}
      <div 
        className={`mt-8 text-center transition-all duration-700 ${
          animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <h1 
          className="text-3xl md:text-4xl font-bold text-foreground"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Beauty Fit by Amel
        </h1>
        <p className="text-muted-foreground mt-2 font-handwritten text-lg">
          Ton coach, ta motivation, ton rythme
        </p>
      </div>

      {/* Loading indicator */}
      <div className={`mt-12 transition-opacity duration-500 ${animationComplete ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes coinFlip {
          0% {
            transform: rotateY(0deg) scale(0.5);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          50% {
            transform: rotateY(900deg) scale(1.1);
          }
          70% {
            transform: rotateY(1620deg) scale(1);
          }
          100% {
            transform: rotateY(1800deg) scale(1);
          }
        }
        
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        
        .animate-fade-out {
          animation: fade-out 0.5s ease-out forwards;
          animation-delay: 0.5s;
        }
        
        .logo-coin {
          backface-visibility: visible;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
