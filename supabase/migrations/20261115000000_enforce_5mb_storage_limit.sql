-- Enforce 5MB (5242880 bytes) file_size_limit across all application storage buckets
UPDATE storage.buckets
SET file_size_limit = 5242880
WHERE id IN ('documents', 'payment-slips', 'avatars');
