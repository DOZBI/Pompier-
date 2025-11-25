// ze-plan/index.ts

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"; 
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0'; 

interface PlanRequest {
  planUrl: string;
  houseId: string;
  mode: 'operational' | 'preventive';
  contextData?: Record<string, any>;
  promptInstruction?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS', 
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonction helper pour appeler Gemini
async function callGemini(model: string, apiKey: string, body: any) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return response;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
     return new Response(JSON.stringify({ error: 'Méthode non supportée. Utilisez POST.' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  let houseId: string | undefined;

  try {
    const requestBody: PlanRequest = await req.json();
    const { planUrl, houseId: id, mode, contextData, promptInstruction } = requestBody;
    
    houseId = id;

    if (!planUrl || !houseId || !mode) {
      throw new Error('planUrl, houseId, et mode sont requis dans le corps de la requête.');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Les secrets SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être configurés.');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
    if (!googleApiKey) {
      throw new Error('GOOGLE_API_KEY doit être configurée dans les secrets Supabase.');
    }

    console.log(`[House ${houseId}] Début du traitement du plan en mode: ${mode}`);
    
    // --- Téléchargement Image ---
    let imageBuffer: ArrayBuffer;
    let mimeType: string;
    const bucketName = 'house-plans';

    try {
      const urlObj = new URL(planUrl);
      const pathSegment = urlObj.pathname.split(`/${bucketName}/`)[1];
      
      if (!pathSegment) throw new Error("Path incorrect");
      
      const filePath = decodeURIComponent(pathSegment);
      console.log(`[House ${houseId}] Téléchargement interne: ${filePath}`);

      const { data, error: downloadError } = await supabaseClient
        .storage
        .from(bucketName)
        .download(filePath);

      if (downloadError) throw downloadError;
      
      imageBuffer = await data.arrayBuffer();
      mimeType = data.type.startsWith('image/') ? data.type : 'image/jpeg'; 
      
    } catch (err) {
      console.warn(`[House ${houseId}] Fallback fetch public: ${planUrl}`);
      const imageResponse = await fetch(planUrl);
      if (!imageResponse.ok) throw new Error(`Erreur fetch image: ${imageResponse.status}`);
      
      const contentType = imageResponse.headers.get("Content-Type");
      if (!contentType?.startsWith('image/')) throw new Error(`Type invalide: ${contentType}`);
      
      mimeType = contentType; 
      imageBuffer = await imageResponse.arrayBuffer();
    }

    const base64Image = encodeBase64(imageBuffer);
    console.log(`[House ${houseId}] Image OK (${base64Image.length} chars). MIME: ${mimeType}`);

    // --- Préparation Prompt ---
    let systemInstruction = "";
    let userPrompt = "";
    
    // CORRECTION : Utilisation de la version spécifique "002"
    let targetModel = "gemini-1.5-flash-002"; 
    
    const isOperationalMode = mode === 'operational';

    if (isOperationalMode) {
      systemInstruction = `Tu es un expert opérationnel pompier. Contexte: ${JSON.stringify(contextData || {})}.`;
      userPrompt = `${promptInstruction || "Rapport opérationnel."}
      IMPORTANT: Retourne UNIQUEMENT un JSON valide (sans Markdown) avec cette structure:
      {
        "operational_summary": "Synthèse SITAC.",
        "access_points": [{"id": "A1", "location": "...", "description": "..."}],
        "evacuation_routes": [{"name": "...", "description": "..."}],
        "risk_zones": [{"zone": "...", "risk": "...", "tactical_advice": "..."}],
        "tactical_recommendations": ["..."]
      }`;
    } else { 
      systemInstruction = "Tu es un architecte expert en sécurité incendie.";
      userPrompt = `Analyse ce plan. Retourne UNIQUEMENT un JSON valide (sans Markdown) avec cette structure:
      {
        "summary": "Description générale.",
        "high_risk_zones": [{"name": "...", "risk_level": 80, "reason": "..."}],
        "evacuation_routes": ["..."],
        "access_points": ["..."],
        "fire_propagation": {"estimated_time_critical": "...", "critical_zones": ["..."]},
        "safety_recommendations": ["..."],
        "overall_risk_score": 5
      }`;
    }
    
    const requestBodyGemini = {
      contents: [{
        parts: [
          { text: systemInstruction + "\n\n" + userPrompt }, 
          { inline_data: { mime_type: mimeType, data: base64Image } }
        ]
      }],
      generationConfig: { response_mime_type: "application/json" }
    };

    console.log(`[House ${houseId}] Appel Gemini (Tentative 1: ${targetModel})...`);

    // --- Appel API avec Retry/Fallback ---
    let geminiResponse = await callGemini(targetModel, googleApiKey, requestBodyGemini);

    // Si 404 sur le modèle Flash, on tente le modèle Pro
    if (geminiResponse.status === 404) {
        console.warn(`[House ${houseId}] Modèle ${targetModel} introuvable (404). Tentative avec gemini-1.5-pro-002...`);
        targetModel = "gemini-1.5-pro-002";
        geminiResponse = await callGemini(targetModel, googleApiKey, requestBodyGemini);
    }

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      // Log détaillé pour débogage
      console.error(`[House ${houseId}] Erreur Gemini Finale (${geminiResponse.status}): ${errText}`);
      throw new Error(`Erreur API Google (${geminiResponse.status}) sur le modèle ${targetModel}: ${errText}`);
    }

    const geminiData = await geminiResponse.json();
    let analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!analysisText) {
      throw new Error("Réponse Gemini vide.");
    }

    analysisText = analysisText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let analysis: Record<string, any>;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      analysis = { parsing_error: "JSON invalide", raw_text: analysisText };
    }

    console.log(`[House ${houseId}] Analyse reçue. Sauvegarde...`);

    // --- Sauvegarde DB ---
    const { data: currentHouse } = await supabaseClient
      .from('houses')
      .select('plan_analysis')
      .eq('id', houseId)
      .single();
    
    const existingAnalysis = (currentHouse?.plan_analysis as Record<string,any>) || {};
    let finalAnalysis: Record<string, any>;

    if (isOperationalMode) {
      finalAnalysis = { ...existingAnalysis, operational_report: analysis };
    } else {
      const existingOp = existingAnalysis.operational_report;
      finalAnalysis = { ...existingAnalysis, ...analysis };
      if (existingOp) finalAnalysis.operational_report = existingOp;
    }

    const { error: updateError } = await supabaseClient
      .from('houses')
      .update({
        plan_analysis: finalAnalysis,
        updated_at: new Date().toISOString()
      })
      .eq('id', houseId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ 
        success: true, 
        message: "Succès",
        analysis: finalAnalysis 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[House ${houseId ?? 'N/A'}] ERREUR:`, errorMessage);

    return new Response(JSON.stringify({ 
      error: 'Erreur interne.',
      details: errorMessage, 
      houseId: houseId ?? 'N/A'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});