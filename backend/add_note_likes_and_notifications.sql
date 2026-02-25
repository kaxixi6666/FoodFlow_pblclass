-- Add note_likes table
CREATE TABLE IF NOT EXISTS note_likes (
    id BIGSERIAL PRIMARY KEY,
    note_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_note_like_note FOREIGN KEY (note_id) REFERENCES recipes(id) ON DELETE CASCADE,
    CONSTRAINT fk_note_like_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_note_user UNIQUE (note_id, user_id)
);

-- Create index on note_id and user_id for faster queries
CREATE INDEX idx_note_likes_note_id ON note_likes(note_id);
CREATE INDEX idx_note_likes_user_id ON note_likes(user_id);

-- Update recipes table to add like_count column
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS like_count BIGINT DEFAULT 0;

-- Create notification table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    receiver_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('LIKE')),
    reference_id BIGINT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_reference FOREIGN KEY (reference_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX idx_notifications_receiver_id ON notifications(receiver_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Create trigger to update like_count when note_likes changes
CREATE OR REPLACE FUNCTION update_note_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE recipes SET like_count = like_count + 1 WHERE id = NEW.note_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE recipes SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.note_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for note_likes table
CREATE TRIGGER update_note_like_count_after_insert
AFTER INSERT ON note_likes
FOR EACH ROW
EXECUTE FUNCTION update_note_like_count();

CREATE TRIGGER update_note_like_count_after_delete
AFTER DELETE ON note_likes
FOR EACH ROW
EXECUTE FUNCTION update_note_like_count();

-- Verify the tables
SELECT 'Note Likes Table:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'note_likes';

SELECT 'Recipes Table (with like_count):' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'like_count';

SELECT 'Notifications Table:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'notifications';
