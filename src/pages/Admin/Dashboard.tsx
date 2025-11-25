import { Card } from "@/components/ui/card";
import { Home, Users, FileText, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminService } from "@/services/adminService";

interface DashboardStats {
  totalHouses: number;
  totalUsers: number;
  pendingHouses: number;
  approvedHouses: number;
  housesWithAnalysis: number;
  recentHouses: Array<{
    id: number;
    address: string;
    city: string;
    status: string;
    created_at: string;
    user: {
      name: string | null;
      email: string | null;
    };
  }>;
  growth: {
    houses: number;
    users: number;
  };
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-muted-foreground">
        Impossible de charger les statistiques
      </div>
    );
  }

  const statsCards = [
    {
      label: "Maisons enregistrées",
      value: stats.totalHouses.toString(),
      icon: Home,
      change: `${stats.growth.houses >= 0 ? '+' : ''}${stats.growth.houses}%`,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Utilisateurs actifs",
      value: stats.totalUsers.toString(),
      icon: Users,
      change: `${stats.growth.users >= 0 ? '+' : ''}${stats.growth.users}%`,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Formulaires en attente",
      value: stats.pendingHouses.toString(),
      icon: FileText,
      change: "À traiter",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      label: "Maisons approuvées",
      value: stats.approvedHouses.toString(),
      icon: TrendingUp,
      change: `${stats.housesWithAnalysis} analysées`,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2">
          Vue d'ensemble de l'application Fire Safe Homes
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6 shadow-card">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card className="p-6 shadow-card">
        <h2 className="text-xl font-semibold mb-4">Activité récente</h2>
        <div className="space-y-4">
          {stats.recentHouses.length > 0 ? (
            stats.recentHouses.map((house) => (
              <div key={house.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="font-medium">Nouvelle maison enregistrée: {house.address}</p>
                  <p className="text-sm text-muted-foreground">
                    Par {house.user?.name || 'Utilisateur inconnu'} ({house.city}) - {new Date(house.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucune activité récente
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;