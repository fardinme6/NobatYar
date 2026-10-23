-- Run once in Neon before deploying Assign Account. Does not alter existing catalog entries.
CREATE TABLE IF NOT EXISTS public.provider_hospitals (
 provider_id BIGINT NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
 hospital_id INTEGER NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
 PRIMARY KEY(provider_id,hospital_id),
 UNIQUE(hospital_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS provider_doctors_one_owner ON public.provider_doctors(doctor_id);
