import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
// Import de l'encodeur Base64 standard de Deno pour éviter le crash mémoire sur gros fichiers
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Gestion des requêtes preflight (CORS)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planUrl, houseId, mode, contextData, promptInstruction } = await req.json();
    
    if (!planUrl || !houseId) {
      throw new Error('planUrl and houseId are required');
    }

    // 1. Configuration Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 2. Vérification Clé Google
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!googleApiKey) {
      throw new Error('GOOGLE_API_KEY is not configured in Supabase secrets');
    }

    console.log(`Processing plan: ${planUrl}`);
    
    // 3. Téléchargement de l'image (Méthode interne via Storage)
    let imageBuffer: ArrayBuffer;

    try {
      const urlObj = new URL(planUrl);
      const pathParts = urlObj.pathname.split('house-plans/');
      
      if (pathParts.length < 2) {
        throw new Error("Format d'URL non reconnu");
      }
      
      const filePath = decodeURIComponent(pathParts[1]);
      console.log(`Downloading internally: ${filePath}`);

      const { data, error: downloadError } = await supabaseClient
        .storage
        .from('house-plans')
        .download(filePath);

      if (downloadError) throw downloadError;
      imageBuffer = await data.arrayBuffer();

    } catch (err) {
      console.warn("Internal download failed, fallback to fetch...", err);
      const imageResponse = await fetch(planUrl);
      if (!imageResponse.ok) throw new Error(`Failed to download image: ${imageResponse.statusText}`);
      imageBuffer = await imageResponse.arrayBuffer();
    }

    // Encodage Base64 robuste
    const base64Image = encode(new Uint8Array(imageBuffer));

    console.log('Starting analysis with Google Gemini...');

    // 4. Préparation des Prompts
    let systemInstruction = "";
    let userPrompt = "";

    if (mode === 'operational') {
      systemInstruction = `Tu es un expert opérationnel pompier (Commandant des Opérations de Secours).
      Analyse tactique requise. Vocabulaire : SITAC, ZRA (Zones à Risque Accru), VE (Voies d'Engin), Reconnaissance.
      Contexte fourni par le propriétaire : ${JSON.stringify(contextData)}.`;

      userPrompt = `${promptInstruction || "Génère un rapport opérationnel complet pour une intervention."}
      
      IMPORTANT : Retourne UNIQUEMENT un JSON valide (sans Markdown) avec cette structure exacte :
      {
        "operational_summary": "Synthèse de la situation et des enjeux.",
        "access_points": [{"id": "A1", "location": "Façade X", "description": "..."}],
        "evacuation_routes": [{"name": "Couloir A", "description": "..."}],
        "risk_zones": [{"zone": "Cuisine", "risk": "Gaz/Elec", "tactical_advice": "Couper l'alimentation"}],
        "tactical_recommendations": ["Action 1", "Action 2"]
      }`;
    } else {
      systemInstruction = "Tu es un architecte expert en sécurité incendie. Analyse préventive.";
      userPrompt = `Analyse ce plan. Retourne UNIQUEMENT un JSON valide (sans Markdown) :
      {
        "summary": "Description générale",
        "high_risk_zones": [{"name": "Zone", "risk_level": 80, "reason": "..."}],
        "evacuation_routes": ["Route 1"],
        "access_points": ["Accès 1"],
        "fire_propagation": {"estimated_time": "15 min", "critical_zones": []},
        "safety_recommendations": ["Conseil 1"],
        "overall_risk_score": 5
      }`;
    }

    // 5. Appel Direct à Google Gemini
    // CORRECTION ICI : Utilisation explicite de 'gemini-1.5-flash-latest'
    const modelVersion = "gemini-1.5-flash-latest"; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${googleApiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [
          { text: systemInstruction + "\n\n" + userPrompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }],
      generationConfig: {
        response_mime_type: "application/json"
      }
    };

    console.log(`Calling Google API model: ${modelVersion}`);

    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Google API Error Detail:", errText);
      throw new Error(`Google API Error (${geminiResponse.status}): ${errText}`);
    }

    const geminiData = await geminiResponse.json();
    
    let analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!analysisText) {
      throw new Error("No content returned from Gemini");
    }

    // Nettoyage JSON
    analysisText = analysisText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      console.error('JSON Parsing failed. Raw text:', analysisText);
      analysis = {
        summary: "Erreur de formatage JSON.",
        operational_summary: analysisText
      };
    }

    console.log('Analysis complete. Saving to DB...');

    // 6. Sauvegarde
    const { data: currentHouse } = await supabaseClient
      .from('houses')
      .select('plan_analysis')
      .eq('id', houseId)
      .single();

    let finalAnalysis = analysis;

    if (currentHouse?.plan_analysis) {
      if (typeof currentHouse.plan_analysis === 'object') {
        if (mode === 'operational') {
          finalAnalysis = { ...currentHouse.plan_analysis, operational_report: analysis };
        } else {
          const existingOp = currentHouse.plan_analysis.operational_report;
          finalAnalysis = { ...analysis, operational_report: existingOp };
        }
      }
    } else if (mode === 'operational') {
        finalAnalysis = { operational_report: analysis };
    }

    const { error: updateError } = await supabaseClient
      .from('houses')
      .update({
        plan_analysis: finalAnalysis,
        updated_at: new Date().toISOString()
      })
      .eq('id', houseId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, analysis: finalAnalysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Function Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});