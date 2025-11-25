import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonction helper pour convertir les gros fichiers en Base64 par morceaux
// Indispensable pour éviter "Maximum call stack size exceeded" sur les gros plans
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 1024 * 32; // 32KB

  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    // @ts-ignore: apply accepts typed array
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

serve(async (req) => {
  // 1. Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planUrl, houseId, mode, contextData, promptInstruction } = await req.json();

    if (!planUrl || !houseId) throw new Error('Paramètres manquants (planUrl ou houseId)');

    // 2. Configuration
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!googleApiKey) throw new Error('GOOGLE_API_KEY manquante');

    console.log(`[${houseId}] Téléchargement du plan...`);

    // 3. Téléchargement et Encodage Image (Interne + Fallback)
    let imageBuffer: ArrayBuffer;
    try {
      const urlObj = new URL(planUrl);
      const filePath = decodeURIComponent(urlObj.pathname.split('house-plans/')[1]);
      const { data, error } = await supabase.storage.from('house-plans').download(filePath);
      if (error) throw error;
      imageBuffer = await data.arrayBuffer();
    } catch (err) {
      console.warn("Download interne échoué, fallback public...", err);
      const res = await fetch(planUrl);
      if (!res.ok) throw new Error("Impossible de télécharger l'image");
      imageBuffer = await res.arrayBuffer();
    }

    const base64Image = arrayBufferToBase64(imageBuffer);
    console.log(`Image encodée. Envoi à Gemini...`);

    // 4. Préparation du Prompt (Système)
    let systemPrompt = "";
    let userPrompt = "";

    if (mode === 'operational') {
      systemPrompt = `Tu es un expert opérationnel pompier (Commandant des Opérations de Secours).
      Ton rôle est d'analyser visuellement le plan fourni pour une intervention tactique.
      Contexte fourni par le propriétaire : ${JSON.stringify(contextData)}.
      
      Analyse requise :
      1. Identification immédiate des accès (A1, A2...).
      2. Zones à Risque Accru (ZRA) : Cuisine, locaux techniques, stockage.
      3. Voies d'Évacuation (VE).
      4. Recommandations tactiques pour l'engagement.
      
      Structure JSON OBLIGATOIRE :
      {
        "operational_summary": "Synthèse tactique courte.",
        "access_points": [{"id": "A1", "location": "...", "description": "..."}],
        "evacuation_routes": [{"name": "...", "description": "..."}],
        "risk_zones": [{"zone": "...", "risk": "...", "tactical_advice": "..."}],
        "tactical_recommendations": ["Ordre 1", "Ordre 2"]
      }`;
    } else {
      systemPrompt = `Tu es un expert en sécurité incendie résidentielle.
      Analyse ce plan pour la prévention.
      Structure JSON OBLIGATOIRE :
      {
        "summary": "Description générale.",
        "high_risk_zones": [{"name": "...", "risk_level": 80, "reason": "..."}],
        "evacuation_routes": ["..."],
        "access_points": ["..."],
        "fire_propagation": {"estimated_time": "...", "critical_zones": []},
        "safety_recommendations": ["..."],
        "overall_risk_score": 5
      }`;
    }

    userPrompt = promptInstruction || "Analyse ce plan.";

    // 5. Appel Google Gemini (Mode JSON forcé)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: systemPrompt + "\n\n" + userPrompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }],
          // Forcer la réponse en JSON pur
          generationConfig: {
            response_mime_type: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google API Error: ${errText}`);
    }

    const aiData = await response.json();
    
    // Extraction et Parsing
    // Gemini en mode JSON renvoie directement le JSON dans le texte
    const jsonString = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonString) throw new Error("Réponse vide de Gemini");

    let analysis;
    try {
      analysis = JSON.parse(jsonString);
    } catch (e) {
      console.error("Erreur parsing JSON Gemini:", jsonString);
      // Tentative de nettoyage si jamais il y a du markdown résiduel (rare avec response_mime_type)
      const cleanText = jsonString.replace(/```json|```/g, '').trim();
      try {
        analysis = JSON.parse(cleanText);
      } catch {
        analysis = { summary: "Erreur format", operational_summary: jsonString };
      }
    }

    console.log('Analyse terminée. Sauvegarde...');

    // 6. Sauvegarde en Base (Fusion intelligente)
    const { data: current } = await supabase.from('houses').select('plan_analysis').eq('id', houseId).single();
    
    let final = analysis;
    if (current?.plan_analysis && typeof current.plan_analysis === 'object') {
      if (mode === 'operational') {
        final = { ...current.plan_analysis, operational_report: analysis };
      } else {
        const op = current.plan_analysis.operational_report;
        final = { ...analysis, operational_report: op };
      }
    } else if (mode === 'operational') {
      final = { operational_report: analysis };
    }

    await supabase.from('houses').update({
      plan_analysis: final,
      updated_at: new Date().toISOString()
    }).eq('id', houseId);

    return new Response(JSON.stringify({ success: true, analysis: final }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Erreur:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});