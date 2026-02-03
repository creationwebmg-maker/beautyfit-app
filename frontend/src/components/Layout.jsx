import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import BottomNavBar from "@/components/BottomNavBar";
import { 
  Home, 
  Play, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Lightbulb,
  Dumbbell
} from "lucide-react";

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { path: "/dashboard", label: "Accueil", icon: Home },
    { path: "/courses", label: "Entraînements", icon: Dumbbell },
    { path: "/conseils", label: "Conseils", icon: Lightbulb },
    { path: "/account", label: "Mon espace", icon: User },
    { path: "/settings", label: "Paramètres", icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/dashboard" 
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "'Playfair Display', serif" }}
              data-testid="nav-logo"
            >
              Amel Fit Coach
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? "bg-foreground text-background"
                      : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                  }`}
                  data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* User section */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Bonjour, <span className="text-foreground font-medium">{user?.first_name}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? "bg-foreground text-background"
                      : "text-foreground/70 hover:bg-secondary"
                  }`}
                  data-testid={`mobile-nav-${link.label.toLowerCase().replace(' ', '-')}`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                data-testid="mobile-logout-btn"
              >
                <LogOut className="w-5 h-5" />
                Se déconnecter
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {children}
      </main>

      {/* Bottom Navigation Bar (Mobile) */}
      <BottomNavBar />
    </div>
  );
};

export default Layout;
