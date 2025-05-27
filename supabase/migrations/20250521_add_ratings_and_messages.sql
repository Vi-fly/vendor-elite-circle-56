
-- Create supplier ratings table
CREATE TABLE IF NOT EXISTS public.supplier_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES public.supplier_applications(id) ON DELETE CASCADE,
    school_id UUID NOT NULL,
    rating_value SMALLINT NOT NULL CHECK (rating_value >= 1 AND rating_value <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(supplier_id, school_id)
);

ALTER TABLE public.supplier_ratings ENABLE ROW LEVEL SECURITY;

-- Allow schools to rate suppliers
CREATE POLICY "Schools can rate suppliers" ON public.supplier_ratings
    FOR ALL USING (auth.uid() = school_id);

-- Allow suppliers to view their own ratings
CREATE POLICY "Suppliers can view their own ratings" ON public.supplier_ratings
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM supplier_applications WHERE id = supplier_id
    ));

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow users to send messages
CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Allow users to read messages where they are sender or recipient
CREATE POLICY "Users can read their own messages" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Allow users to mark messages as read if they are the recipient
CREATE POLICY "Recipients can mark messages as read" ON public.messages
    FOR UPDATE USING (auth.uid() = recipient_id)
    WITH CHECK (auth.uid() = recipient_id AND (
        -- Only allow updating the is_read field
        (xmax::text::int > 0 AND (is_read IS DISTINCT FROM OLD.is_read))
    ));

-- Create function to notify clients about new messages
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'new_message',
    json_build_object(
      'id', NEW.id,
      'sender_id', NEW.sender_id,
      'recipient_id', NEW.recipient_id
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to notify about new messages
CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_message();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS supplier_ratings_supplier_id_idx ON public.supplier_ratings (supplier_id);
CREATE INDEX IF NOT EXISTS supplier_ratings_school_id_idx ON public.supplier_ratings (school_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages (sender_id);
CREATE INDEX IF NOT EXISTS messages_recipient_id_idx ON public.messages (recipient_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages (created_at);
