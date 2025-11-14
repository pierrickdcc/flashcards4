-- ===================================================================
-- SCRIPT DE MIGRATION SQL POUR SUPABASE
-- ===================================================================
-- Objectif : Mettre à jour la structure des tables 'cards' et 'courses'
--            pour utiliser des clés étrangères vers la table 'subjects'.
--
-- ATTENTION : Faites une sauvegarde de votre base de données avant
--            d'exécuter ce script.
-- ===================================================================

-- ==================
--  ÉTAPE 1 : Table 'cards'
-- ==================

-- 1. Ajouter la nouvelle colonne `subject_id` à la table `cards`.
ALTER TABLE public.cards
ADD COLUMN subject_id UUID;

-- 2. Remplir la nouvelle colonne `subject_id` en faisant correspondre
--    les noms des matières de `cards.subject` avec `subjects.name`.
--    Cette commande joint les deux tables sur le nom de la matière et l'ID du workspace.
UPDATE public.cards c
SET subject_id = s.id
FROM public.subjects s
WHERE c.subject = s.name AND c.workspace_id = s.workspace_id;

-- 3. Ajouter la contrainte de clé étrangère.
--    `ON DELETE SET NULL` signifie que si une matière est supprimée,
--    `subject_id` dans les cartes associées deviendra NULL.
ALTER TABLE public.cards
ADD CONSTRAINT cards_subject_id_fkey FOREIGN KEY (subject_id)
REFERENCES public.subjects(id) ON DELETE SET NULL;

-- 4. (Optionnel mais recommandé) Supprimer l'ancienne colonne `subject`.
--    Assurez-vous que votre application n'utilise plus cette colonne avant d'exécuter.
-- ALTER TABLE public.cards
-- DROP COLUMN subject;

-- 5. (Optionnel mais recommandé) Supprimer l'ancien index sur `subject`.
-- DROP INDEX IF EXISTS public.idx_cards_subject;

-- 6. Créer un nouvel index sur `subject_id` pour des performances optimales.
CREATE INDEX IF NOT EXISTS idx_cards_subject_id ON public.cards(subject_id);


-- ==================
--  ÉTAPE 2 : Table 'courses'
-- ==================

-- 1. Ajouter la nouvelle colonne `subject_id` à la table `courses`.
ALTER TABLE public.courses
ADD COLUMN subject_id UUID;

-- 2. Remplir la nouvelle colonne `subject_id` pour les cours.
UPDATE public.courses co
SET subject_id = s.id
FROM public.subjects s
WHERE co.subject = s.name AND co.workspace_id = s.workspace_id;

-- 3. Ajouter la contrainte de clé étrangère.
ALTER TABLE public.courses
ADD CONSTRAINT courses_subject_id_fkey FOREIGN KEY (subject_id)
REFERENCES public.subjects(id) ON DELETE SET NULL;

-- 4. (Optionnel mais recommandé) Supprimer l'ancienne colonne `subject`.
-- ALTER TABLE public.courses
-- DROP COLUMN subject;

-- 5. (Optionnel mais recommandé) Supprimer l'ancien index.
-- DROP INDEX IF EXISTS public.idx_courses_subject;

-- 6. Créer un nouvel index sur `subject_id`.
CREATE INDEX IF NOT EXISTS idx_courses_subject_id ON public.courses(subject_id);

-- ===================================================================
-- FIN DU SCRIPT
-- ===================================================================
