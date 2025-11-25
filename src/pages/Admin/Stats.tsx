import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Home, Users, Eye, FileText, TrendingUp, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Stats = () => {
  const [stats, setStats] = useState({
    totalHouses: 0,
    totalUsers: 0,
    housesWithPlans: 0,
    housesAnalyzed: 0
  });
  const [sensitiveObjectsData, setSensitiveObjectsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch houses count
      const { count: housesCount } = await supabase
        .from('houses')
        .select('*', { count: 'exact', head: true });

      // Fetch users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch houses with plans
      const { count: plansCount } = await supabase
        .from('houses')
        .select('*', { count: 'exact', head: true })
        .not('plan_url', 'is', null);

      // Fetch houses with analysis
      const { count: analyzedCount } = await supabase
        .from('houses')
        .select('*', { count: 'exact', head: true })
        .not('plan_analysis', 'is', null);

      // Fetch sensitive objects
      const { data: houses } = await supabase
        .from('houses')
        .select('sensitive_objects')
        .not('sensitive_objects', 'is', null);

      // Count sensitive objects
      const objectsCount: any = {};
      houses?.forEach((house: any) => {
        if (house.sensitive_objects && Array.isArray(house.sensitive_objects)) {
          house.sensitive_objects.forEach((obj: string) => {
            objectsCount[obj] = (objectsCount[obj] || 0) + 1;
          });
        }
      });

      const colors = ["#f97316", "#eab308", "#22c55e", "#3b82f6", "#f59e0b", "#a855f7"];
      const sensitiveData = Object.entries(objectsCount)
        .map(([name, value], index) => ({
          name,
          value: value as number,
          color: colors[index % colors.length]
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      setStats({
        totalHouses: housesCount || 0,
        totalUsers: usersCount || 0,
        housesWithPlans: plansCount || 0,
        housesAnalyzed: analyzedCount || 0
      });

      setSensitiveObjectsData(sensitiveData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total maisons",
      value: stats.totalHouses.toString(),
      icon: Home,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Utilisateurs actifs",
      value: stats.totalUsers.toString(),
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Maisons avec plans",
      value: stats.housesWithPlans.toString(),
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: "Plans analysés",
      value: stats.housesAnalyzed.toString(),
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-20 bg-muted rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Statistiques en temps réel</h1>
        <p className="text-muted-foreground mt-2">
          Aperçu des données actuelles du système
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Sensitive Objects Chart */}
      {sensitiveObjectsData.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-6">Objets sensibles les plus fréquents</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sensitiveObjectsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sensitiveObjectsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-6">Répartition des analyses</h2>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Plans uploadés</span>
                    <span className="text-2xl font-bold">{stats.housesWithPlans}</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${stats.totalHouses > 0 ? (stats.housesWithPlans / stats.totalHouses) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Plans analysés</span>
                    <span className="text-2xl font-bold">{stats.housesAnalyzed}</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${stats.housesWithPlans > 0 ? (stats.housesAnalyzed / stats.housesWithPlans) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Top Sensitive Objects List */}
          <Card className="p-6 shadow-card">
            <h2 className="text-xl font-semibold mb-4">Classement des objets sensibles</h2>
            <div className="space-y-3">
              {sensitiveObjectsData.map((obj, index) => (
                <div key={obj.name} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full gradient-fire text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{obj.name}</span>
                      <span className="text-sm text-muted-foreground">{obj.value} déclarations</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${sensitiveObjectsData[0] ? (obj.value / sensitiveObjectsData[0].value) * 100 : 0}%`,
                          backgroundColor: obj.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default Stats;
