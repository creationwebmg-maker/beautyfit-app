import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Dumbbell, TrendingUp, User } from "lucide-react";

const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: "programme",
      label: "Programme",
      icon: Dumbbell,
      path: "/dashboard"
    },
    {
      id: "progres",
      label: "Progrès",
      icon: TrendingUp,
      path: "/progres"
    },
    {
      id: "espace",
      label: "Mon espace",
      icon: User,
      path: "/account"
    }
  ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard" || location.pathname.startsWith("/programme");
    }
    return location.pathname === path;
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 border-t safe-area-bottom"
      style={{ 
        background: '#F7F5F2',
        borderColor: '#D2DDE7'
      }}
    >
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center gap-1 py-2 px-4 transition-all"
                data-testid={`nav-${item.id}`}
              >
                <div 
                  className={`p-2 rounded-full transition-all ${active ? 'scale-110' : ''}`}
                  style={{ 
                    background: active ? 'linear-gradient(135deg, #E37E7F, #EE9F80)' : 'transparent'
                  }}
                >
                  <Icon 
                    className="w-5 h-5 transition-colors"
                    style={{ color: active ? 'white' : '#D5A0A8' }}
                  />
                </div>
                <span 
                  className="text-xs font-medium transition-colors"
                  style={{ color: active ? '#E37E7F' : '#999' }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Safe area padding for iOS */}
      <style>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
      `}</style>
    </nav>
  );
};

export default BottomNavBar;
