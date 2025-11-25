import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  adminUser: { email: string; name: string } | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Identifiants mockés pour l'admin
const MOCK_ADMIN_CREDENTIALS = {
  email: "admin@firesafe.com",
  password: "admin123",
  name: "Administrateur Fire Safe"
};

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<{ email: string; name: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'admin est déjà connecté (session stockée)
    const storedAuth = localStorage.getItem("admin_auth");
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        setIsAuthenticated(true);
        setAdminUser(authData);
      } catch (error) {
        localStorage.removeItem("admin_auth");
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Vérifier les identifiants mockés
    if (email === MOCK_ADMIN_CREDENTIALS.email && password === MOCK_ADMIN_CREDENTIALS.password) {
      const authData = {
        email: MOCK_ADMIN_CREDENTIALS.email,
        name: MOCK_ADMIN_CREDENTIALS.name
      };
      
      setIsAuthenticated(true);
      setAdminUser(authData);
      localStorage.setItem("admin_auth", JSON.stringify(authData));
      
      return {};
    }
    
    return { error: "Identifiants invalides" };
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setAdminUser(null);
    localStorage.removeItem("admin_auth");
    navigate("/admin/login");
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, adminUser, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
