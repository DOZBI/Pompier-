import { Link } from "react-router-dom";
import { Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <span className="font-bold text-xl text-foreground">FireSafe</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/">Accueil</NavLink>
            <NavLink to="/profiles">Profils</NavLink>
            <NavLink to="/blog">Blog</NavLink>
            <NavLink to="/register-house">Enregistrer</NavLink>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden md:block">
                {user.email}
              </span>
              <Button
                onClick={signOut}
                variant="outline"
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Déconnexion</span>
              </Button>
            </div>
          ) : (
            <Button asChild className="gradient-fire border-0">
              <Link to="/auth">Connexion</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;