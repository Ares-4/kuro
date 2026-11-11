-- Unsplash photo 1523050854058 was removed (returns 404), so 4 course pages
-- showed a broken hero image. Point them at a working campus photo.
update programs
set image_url = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=70&auto=format&fit=crop',
    updated_at = now()
where image_url like '%photo-1523050854058%';
