-- Schema Supabase pour Proxeo — Landing Page
-- Exécuter ce SQL dans l'éditeur SQL de Supabase (https://app.supabase.com)

-- Table des contacts (formulaire de contact)
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  email TEXT NOT NULL,
  company_type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS et autoriser les insertions publiques (pas d'auth requise)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Politique : autoriser uniquement les insertions (pas de lecture/modification/suppression publique)
CREATE POLICY "Allow public insert on contacts" ON contacts
  FOR INSERT
  WITH CHECK (true);
