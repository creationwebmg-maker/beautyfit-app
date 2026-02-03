import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Dumbbell, Lightbulb, User } from "lucide-react";

const BottomNavBar = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/courses",
      label: "Entraînements",
      icon: Dumbbell,
    },
    {
      path: "/conseils",
      label: "Conseils",
      icon: Lightbulb,
    },
    {
      path: "/account",
      label: "Mon espace",
      icon: User,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all ${
              isActive(item.path)
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
            data-testid={`bottom-nav-${item.label.toLowerCase().replace(' ', '-')}`}
          >
            <div className={`p-2 rounded-full transition-all ${
              isActive(item.path)
                ? "bg-foreground text-background"
                : "bg-transparent"
            }`}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className={`text-xs font-medium ${
              isActive(item.path) ? "text-foreground" : ""
            }`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
      {/* Safe area for iOS */}
      <div className="h-safe-area-inset-bottom bg-card" />
    </nav>
  );
};

export default BottomNavBar;
