import { createClient } from '@supabase/supabase-js';

// Votre URL Supabase (récupérée de votre projet)
const SUPABASE_URL = "https://sfgncyerlcditfepasjo.supabase.co";

// ⚠️ REMPLACEZ CECI PAR VOTRE CLÉ SERVICE_ROLE (Celle qui commence par eyJ...) ⚠️
const SERVICE_KEY = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjM4Nzk3NzUsImlkIjoiYTE2MjlmYWEtMjkzNi00MmU2LTllYTctNzM3ZDVkMmM0YmVjIiwicmlkIjoiYThjNjM5ZTMtMTBmZC00ZDAwLTkwOWUtOTg3NjMxZThmYmNmIn0.Yowklw15Y2etHrrmolnacgbiIpa_VyZPScT_yIE_UGuWR7UT_wIjRDi7VjV8HjKCQe40pZML4G3BlkKFXPhMBQ";

if (SERVICE_KEY === "COLLEZ_VOTRE_CLE_SERVICE_ROLE_ICI") {
    console.error("❌ ERREUR : Vous n'avez pas collé la clé service_role dans le fichier init-storage.ts !");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function initStorage() {
  console.log('🔄 Initialisation du stockage sur :', SUPABASE_URL);

  try {
    // 1. Créer le bucket
    const { data, error } = await supabase
      .storage
      .createBucket('house-plans', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
      });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Le bucket "house-plans" existe déjà.');
      } else {
        console.error('❌ Erreur création bucket:', error.message);
      }
    } else {
      console.log('✅ Bucket "house-plans" créé avec succès.');
    }
    
    console.log('✨ Terminé ! Vous pouvez maintenant uploader des fichiers.');

  } catch (err) {
    console.error('❌ Erreur inattendue:', err);
  }
}

initStorage();