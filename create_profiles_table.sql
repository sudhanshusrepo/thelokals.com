CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT auth.uid(),
  phone_number text NOT NULL,
  is_phone_verified boolean NULL,
  full_name text NOT NULL,
  dob date NULL,
  gender text NULL,
  city text NULL,
  locality text NULL,
  documents jsonb NULL,
  guidelines_accepted boolean NULL,
  registration_status text NULL,
  created_at timestamptz NULL DEFAULT now(),
  updated_at timestamptz NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);