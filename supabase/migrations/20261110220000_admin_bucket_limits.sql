-- Admin upload buckets had no size or type limits. Caps chosen above the largest
-- existing file in each (site-assets 7 KB PNG, blog-images 2.4 MB PNG,
-- media-content 10.7 MB MP4). SVG is left out on purpose: SVG can carry script.

update storage.buckets set
  file_size_limit = 5 * 1024 * 1024,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon']
where id = 'site-assets';

update storage.buckets set
  file_size_limit = 10 * 1024 * 1024,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
where id = 'blog-images';

update storage.buckets set
  file_size_limit = 50 * 1024 * 1024,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf']
where id = 'media-content';
