-- Migration: Reviews and Ratings
-- Description: Create reviews table and rating aggregation
-- Phase: 3 of 6

-- Drop old reviews table if it exists
DROP TABLE IF EXISTS public.reviews CASCADE;

-- Reviews Table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES public.bookings NOT NULL UNIQUE,
  client_id uuid REFERENCES auth.users NOT NULL,
  provider_id uuid REFERENCES public.providers NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT unique_booking_review UNIQUE(booking_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_reviews_provider ON public.reviews(provider_id, created_at DESC);
CREATE INDEX idx_reviews_client ON public.reviews(client_id, created_at DESC);
CREATE INDEX idx_reviews_booking ON public.reviews(booking_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

-- Function to update provider rating
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
DECLARE
  new_avg_rating numeric;
  total_reviews integer;
BEGIN
  -- Calculate new average rating
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO new_avg_rating, total_reviews
  FROM public.reviews 
  WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id);
  
  -- Update provider record
  UPDATE public.providers 
  SET 
    rating_average = new_avg_rating,
    updated_at = now()
  WHERE id = COALESCE(NEW.provider_id, OLD.provider_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update provider rating after review insert/update/delete
CREATE TRIGGER update_provider_rating_on_review_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

CREATE TRIGGER update_provider_rating_on_review_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

CREATE TRIGGER update_provider_rating_on_review_delete
  AFTER DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

-- Function to update provider total jobs
CREATE OR REPLACE FUNCTION update_provider_total_jobs()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status != 'COMPLETED') THEN
    UPDATE public.providers
    SET 
      total_jobs = total_jobs + 1,
      total_earnings = total_earnings + COALESCE(NEW.final_cost, 0),
      updated_at = now()
    WHERE id = NEW.provider_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update provider stats when booking is completed
CREATE TRIGGER update_provider_stats_on_booking_complete
  AFTER UPDATE ON public.bookings
  FOR EACH ROW 
  WHEN (NEW.status = 'COMPLETED')
  EXECUTE FUNCTION update_provider_total_jobs();
