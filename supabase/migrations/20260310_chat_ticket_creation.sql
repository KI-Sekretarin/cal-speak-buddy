-- Migration: Support ticket creation from chatbot
-- Adds GIN index on chat_messages.metadata for efficient action-based lookups

CREATE INDEX IF NOT EXISTS idx_chat_messages_metadata_action 
ON public.chat_messages USING gin (metadata);
