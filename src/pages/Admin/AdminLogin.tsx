import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { toast } from "sonner";
import { Flame, Lock, Mail, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger si déjà connecté
    if (isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Connexion réussie!");
        navigate("/admin");
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const fillMockCredentials = () => {
    setEmail("admin@firesafe.com");
    setPassword("admin123");
    toast.info("Identifiants admin pré-remplis");
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-md p-8 shadow-card">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Flame className="h-12 w-12 text-fire-500" />
              <ShieldCheck className="h-6 w-6 text-primary absolute -bottom-1 -right-1 bg-background rounded-full" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Administration</h1>
              <p className="text-sm text-muted-foreground">Fire Safe Homes</p>
            </div>
          </div>

          <div className="w-full space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Connexion administrateur</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Accédez au panneau d'administration
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email administrateur</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@firesafe.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gradient-fire border-0"
                disabled={loading}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            {/* Mock credentials helper */}
            <Card className="p-4 bg-muted/50 border-dashed">
              <div className="space-y-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Identifiants de test
                </p>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p>Email: <code className="bg-background px-2 py-1 rounded">admin@firesafe.com</code></p>
                  <p>Mot de passe: <code className="bg-background px-2 py-1 rounded">admin123</code></p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={fillMockCredentials}
                >
                  Utiliser les identifiants de test
                </Button>
              </div>
            </Card>

            <div className="text-center text-xs text-muted-foreground">
              <p>Accès réservé aux administrateurs autorisés</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
