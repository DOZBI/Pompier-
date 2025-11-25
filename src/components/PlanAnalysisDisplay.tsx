import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Clock, Flame, MapPin, ShieldAlert } from "lucide-react";

interface PlanAnalysisDisplayProps {
  analysis: {
    summary?: string;
    high_risk_zones?: Array<{
      name: string;
      risk_level: number;
      reason: string;
    }>;
    evacuation_routes?: string[];
    access_points?: string[];
    fire_propagation?: {
      estimated_time: string;
      critical_zones: string[];
    };
    safety_recommendations?: string[];
    overall_risk_score?: number;
    analyzed_at?: string;
  };
}

export const PlanAnalysisDisplay = ({ analysis }: PlanAnalysisDisplayProps) => {
  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-500";
    if (score >= 40) return "text-orange-500";
    return "text-green-500";
  };

  const getRiskBadge = (score: number) => {
    if (score >= 70) return <Badge variant="destructive">Risque élevé</Badge>;
    if (score >= 40) return <Badge className="bg-orange-500">Risque moyen</Badge>;
    return <Badge className="bg-green-500">Risque faible</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-card border-primary/20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-primary" />
              Analyse du Plan par IA
            </h3>
            {analysis.analyzed_at && (
              <p className="text-sm text-muted-foreground mt-1">
                Analysé le {new Date(analysis.analyzed_at).toLocaleString('fr-FR')}
              </p>
            )}
          </div>
          {analysis.overall_risk_score !== undefined && (
            <div className="text-right">
              <div className={`text-3xl font-bold ${getRiskColor(analysis.overall_risk_score * 10)}`}>
                {analysis.overall_risk_score.toFixed(1)}/10
              </div>
              <div className="mt-1">
                {getRiskBadge(analysis.overall_risk_score * 10)}
              </div>
            </div>
          )}
        </div>

        {analysis.summary && (
          <p className="text-muted-foreground mb-4">{analysis.summary}</p>
        )}
      </Card>

      {analysis.high_risk_zones && analysis.high_risk_zones.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-500" />
            Zones à Haut Risque
          </h4>
          <div className="space-y-3">
            {analysis.high_risk_zones.map((zone, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{zone.name}</div>
                  <div className="text-sm text-muted-foreground">{zone.reason}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getRiskColor(zone.risk_level)}`}>
                    {zone.risk_level}%
                  </span>
                  {zone.risk_level >= 70 && <AlertTriangle className="h-5 w-5 text-red-500" />}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {analysis.fire_propagation && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Propagation du Feu
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Temps estimé:</span>
              <span className="font-medium">{analysis.fire_propagation.estimated_time}</span>
            </div>
            {analysis.fire_propagation.critical_zones.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground block mb-2">Zones critiques:</span>
                <div className="flex flex-wrap gap-2">
                  {analysis.fire_propagation.critical_zones.map((zone, index) => (
                    <Badge key={index} variant="outline">{zone}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {analysis.evacuation_routes && analysis.evacuation_routes.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Chemins d'Évacuation
          </h4>
          <ul className="space-y-2">
            {analysis.evacuation_routes.map((route, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{route}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {analysis.access_points && analysis.access_points.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Points d'Accès Pompiers
          </h4>
          <ul className="space-y-2">
            {analysis.access_points.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {analysis.safety_recommendations && analysis.safety_recommendations.length > 0 && (
        <Card className="p-6 border-primary/30 bg-primary/5">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Recommandations de Sécurité
          </h4>
          <ul className="space-y-2">
            {analysis.safety_recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1 flex-shrink-0">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};
