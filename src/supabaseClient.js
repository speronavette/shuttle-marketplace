import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// DEBUG : Afficher les valeurs
console.log('🔍 DEBUG Supabase Config:')
console.log('URL:', supabaseUrl)
console.log('Key (premiers 20 car):', supabaseAnonKey?.substring(0, 20))

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERREUR: Variables d\'environnement manquantes!')
  console.log('Vérifiez votre fichier .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)