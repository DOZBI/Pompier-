import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen gradient-fire flex items-center justify-center px-4">
      <div className="text-center space-y-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm mb-8">
          <Shield className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
          Secure Pompiers<br />
          Congo
        </h1>
        <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
          Système de gestion et prévention des incendies
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link to="/register-house">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Enregistrer une maison
            </Button>
          </Link>
          <Link to="/profiles">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Voir les profils
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
