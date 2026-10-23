-- Run this once in Neon before deploying the updated Backend.
-- Explicit dates only; existing weekly schedules remain untouched but are not used for booking.
CREATE TABLE IF NOT EXISTS public.doctor_available_dates (
 doctor_id INTEGER NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
 date VARCHAR(10) NOT NULL,
 start_time VARCHAR(5) NOT NULL,
 end_time VARCHAR(5) NOT NULL,
 slot_minutes INTEGER NOT NULL DEFAULT 30 CHECK (slot_minutes BETWEEN 10 AND 120),
 PRIMARY KEY (doctor_id, date),
 CHECK (start_time < end_time)
);
CREATE INDEX IF NOT EXISTS doctor_available_dates_date_idx ON public.doctor_available_dates(date);
