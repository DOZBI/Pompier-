import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, Download, Calendar as CalendarIcon, RefreshCw, TrendingUp, AlertTriangle } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type DateRange = {
  from: Date;
  to: Date;
};

const Reports = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('generated_at', { ascending: false })
      .limit(20);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les rapports",
        variant: "destructive"
      });
      return;
    }

    setReports(data || []);
    if (data && data.length > 0 && !selectedReport) {
      setSelectedReport(data[0]);
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          reportType: 'general',
          periodStart: dateRange.from.toISOString(),
          periodEnd: dateRange.to.toISOString()
        }
      });

      if (error) throw error;

      toast({
        title: "Rapport généré",
        description: "Le rapport a été créé avec succès"
      });

      await fetchReports();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer le rapport",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = () => {
    if (!selectedReport) return;
    
    const dataStr = JSON.stringify(selectedReport.report_data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-${format(new Date(selectedReport.generated_at), 'yyyy-MM-dd')}.json`;
    link.click();
  };

  const quickRanges = [
    { label: "7 derniers jours", days: 7 },
    { label: "30 derniers jours", days: 30 },
    { label: "Ce mois", custom: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rapports et Analyses</h1>
          <p className="text-muted-foreground mt-2">
            Générez et consultez des rapports automatiques sur les données
          </p>
        </div>
        <Button onClick={generateReport} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Génération...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Générer un rapport
            </>
          )}
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Période du rapport</h2>
        <div className="flex flex-wrap gap-4">
          {quickRanges.map((range) => (
            <Button
              key={range.label}
              variant="outline"
              onClick={() => {
                if (range.custom) {
                  setDateRange(range.custom());
                } else {
                  setDateRange({
                    from: subDays(new Date(), range.days!),
                    to: new Date()
                  });
                }
              }}
            >
              {range.label}
            </Button>
          ))}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, "dd MMM", { locale: fr })} - {format(dateRange.to, "dd MMM", { locale: fr })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Reports List */}
        <Card className="lg:col-span-1 p-4">
          <h2 className="text-lg font-semibold mb-4">Rapports générés</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedReport?.id === report.id
                    ? 'bg-primary/10 border border-primary'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <FileText className="h-4 w-4 mt-1 mr-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {format(new Date(report.generated_at), "dd MMM yyyy", { locale: fr })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(report.generated_at), "HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Report Details */}
        <div className="lg:col-span-3 space-y-6">
          {selectedReport ? (
            <>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Rapport du {format(new Date(selectedReport.generated_at), "dd MMMM yyyy", { locale: fr })}
                    </h2>
                    <p className="text-muted-foreground">
                      Période: {format(new Date(selectedReport.report_data.summary.periodStart), "dd MMM", { locale: fr })} - {format(new Date(selectedReport.report_data.summary.periodEnd), "dd MMM", { locale: fr })}
                    </p>
                  </div>
                  <Button variant="outline" onClick={exportReport}>
                    <Download className="mr-2 h-4 w-4" />
                    Exporter
                  </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total maisons</p>
                    <p className="text-2xl font-bold">{selectedReport.report_data.summary.totalHouses}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Utilisateurs</p>
                    <p className="text-2xl font-bold">{selectedReport.report_data.summary.totalUsers}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Avec plans</p>
                    <p className="text-2xl font-bold">{selectedReport.report_data.summary.housesWithPlans}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Analysés</p>
                    <p className="text-2xl font-bold">{selectedReport.report_data.summary.housesWithAnalysis}</p>
                  </div>
                </div>
              </Card>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Distribution par statut</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={Object.entries(selectedReport.report_data.distributions.status || {}).map(([name, value]) => ({
                          name,
                          value
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.keys(selectedReport.report_data.distributions.status || {}).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                {/* Property Type Distribution */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Types de propriété</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={Object.entries(selectedReport.report_data.distributions.propertyType || {}).map(([name, value]) => ({
                      name,
                      value
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Sensitive Objects */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                  Objets sensibles les plus fréquents
                </h3>
                <div className="space-y-3">
                  {selectedReport.report_data.sensitiveObjects?.slice(0, 5).map((obj: any, index: number) => (
                    <div key={obj.name} className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{obj.name}</span>
                          <span className="text-sm text-muted-foreground">{obj.count} déclarations</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                            style={{
                              width: `${(obj.count / selectedReport.report_data.sensitiveObjects[0].count) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Trends */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                  Tendances
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Nombre moyen de pièces</p>
                    <p className="text-3xl font-bold">
                      {selectedReport.report_data.trends.averageRoomsPerHouse.toFixed(1)}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Surface moyenne (m²)</p>
                    <p className="text-3xl font-bold">
                      {selectedReport.report_data.trends.averageSurfaceArea.toFixed(0)}
                    </p>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Sélectionnez un rapport ou générez-en un nouveau
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;