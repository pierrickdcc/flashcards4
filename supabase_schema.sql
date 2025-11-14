-- =============================================
-- Table: subjects
-- Description: Stocke les matières créées par les utilisateurs.
-- =============================================
CREATE TABLE public.subjects (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT subjects_pkey PRIMARY KEY (id),
    CONSTRAINT subjects_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT subjects_workspace_id_name_key UNIQUE (workspace_id, name)
);

-- Index pour accélérer les recherches par workspace_id
CREATE INDEX idx_subjects_workspace_id ON public.subjects USING btree (workspace_id);


-- =============================================
-- Table: courses
-- Description: Stocke les cours créés par les utilisateurs.
-- =============================================
CREATE TABLE public.courses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    title text NOT NULL,
    content text,
    subject_id uuid, -- Modifié de 'subject text'
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT courses_pkey PRIMARY KEY (id),
    CONSTRAINT courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT courses_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE SET NULL -- Ajout de la clé étrangère
);

-- Index pour accélérer les recherches
CREATE INDEX idx_courses_workspace_id ON public.courses USING btree (workspace_id);
CREATE INDEX idx_courses_subject_id ON public.courses USING btree (subject_id); -- Modifié de 'idx_courses_subject'


-- =============================================
-- Table: cards
-- Description: Stocke les flashcards créées par les utilisateurs.
-- =============================================
CREATE TABLE public.cards (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    subject_id uuid, -- Modifié de 'subject text'
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT cards_pkey PRIMARY KEY (id),
    CONSTRAINT cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT cards_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE SET NULL -- Ajout de la clé étrangère
);

-- Index pour accélérer les recherches
CREATE INDEX idx_cards_workspace_id ON public.cards USING btree (workspace_id);
CREATE INDEX idx_cards_subject_id ON public.cards USING btree (subject_id); -- Modifié de 'idx_cards_subject'


-- =============================================
-- Table: user_card_progress
-- Description: Stocke la progression de chaque utilisateur pour chaque carte (répétition espacée).
-- =============================================
CREATE TABLE public.user_card_progress (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    card_id uuid NOT NULL,
    next_review timestamp with time zone NOT NULL,
    interval integer NOT NULL DEFAULT 1,
    easiness real NOT NULL DEFAULT 2.5,
    review_count integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT user_card_progress_pkey PRIMARY KEY (id),
    CONSTRAINT user_card_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT user_card_progress_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.cards(id) ON DELETE CASCADE,
    CONSTRAINT user_card_progress_user_id_card_id_key UNIQUE (user_id, card_id)
);

-- Index pour accélérer les recherches de cartes à réviser
CREATE INDEX idx_user_card_progress_user_id_next_review ON public.user_card_progress USING btree (user_id, next_review);


-- =============================================
-- Table: memos
-- Description: Stocke les mémos (post-it) créés par les utilisateurs.
-- =============================================
CREATE TABLE public.memos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    workspace_id uuid NOT NULL,
    content text,
    color text NOT NULL DEFAULT 'yellow',
    course_id uuid,
    is_pinned boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT memos_pkey PRIMARY KEY (id),
    CONSTRAINT memos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT memos_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL
);

-- Index pour accélérer les recherches
CREATE INDEX idx_memos_workspace_id ON public.memos USING btree (workspace_id);
CREATE INDEX idx_memos_user_id ON public.memos USING btree (user_id);


-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Activer RLS pour chaque table
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_card_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memos ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table "subjects"
CREATE POLICY "Les utilisateurs peuvent voir leurs propres matières" ON public.subjects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent insérer leurs propres matières" ON public.subjects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres matières" ON public.subjects
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres matières" ON public.subjects
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour la table "courses"
CREATE POLICY "Les utilisateurs peuvent voir leurs propres cours" ON public.courses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent insérer leurs propres cours" ON public.courses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres cours" ON public.courses
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres cours" ON public.courses
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour la table "cards"
CREATE POLICY "Les utilisateurs peuvent voir leurs propres cartes" ON public.cards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent insérer leurs propres cartes" ON public.cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres cartes" ON public.cards
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres cartes" ON public.cards
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour la table "user_card_progress"
CREATE POLICY "Les utilisateurs peuvent voir leur propre progression" ON public.user_card_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent insérer leur propre progression" ON public.user_card_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre progression" ON public.user_card_progress
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leur propre progression" ON public.user_card_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour la table "memos"
CREATE POLICY "Les utilisateurs peuvent voir leurs propres mémos" ON public.memos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent insérer leurs propres mémos" ON public.memos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres mémos" ON public.memos
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres mémos" ON public.memos
    FOR DELETE USING (auth.uid() = user_id);
