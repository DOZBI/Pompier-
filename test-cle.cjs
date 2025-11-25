const https = require('https');

// ⚠️ REMETTEZ VOTRE CLÉ ICI
const API_KEY = "AIzaSyBk-5JSa4JKAn7YbLu5IpbyeOonsl1mlJk"; 

// On demande la liste complète des modèles
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log("Recherche des modèles disponibles...");

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => { data += chunk; });

  res.on('end', () => {
    if (res.statusCode === 200) {
      const json = JSON.parse(data);
      console.log("✅ Modèles disponibles pour cette clé :");
      console.log("-----------------------------------");
      json.models.forEach(m => {
        // On affiche seulement les modèles qui supportent "generateContent"
        if (m.supportedGenerationMethods.includes("generateContent")) {
           console.log(`- ${m.name.replace('models/', '')}`);
        }
      });
    } else {
      console.log(`❌ Erreur ${res.statusCode}:`, data);
    }
  });
});