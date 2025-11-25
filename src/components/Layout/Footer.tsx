import { Link } from "react-router-dom";
import { Flame, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg gradient-fire flex items-center justify-center">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Fire Safe Homes</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Protection incendie pour tous. Enregistrez votre maison pour une meilleure sécurité.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-smooth">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/profiles" className="text-muted-foreground hover:text-primary transition-smooth">
                  Profils
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-smooth">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/register-house" className="text-muted-foreground hover:text-primary transition-smooth">
                  Enregistrer une maison
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-smooth">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-smooth">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-muted-foreground hover:text-primary transition-smooth">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>contact@firesafe.fr</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Paris, France</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Fire Safe Homes. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
