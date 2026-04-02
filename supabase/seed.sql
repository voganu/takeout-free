-- Demo categories (requests)
INSERT INTO categories (id, name, slug, description, icon, type) VALUES
  ('11111111-1111-1111-1111-111111111101', 'IT та Програмування', 'it-programming', 'Розробка програмного забезпечення, веб-сайтів, мобільних додатків', '💻', 'request'),
  ('11111111-1111-1111-1111-111111111102', 'Дизайн', 'design', 'Графічний дизайн, UI/UX, брендинг', '🎨', 'request'),
  ('11111111-1111-1111-1111-111111111103', 'Ремонт та Будівництво', 'repair-construction', 'Ремонт квартир, будівельні роботи', '🔧', 'request'),
  ('11111111-1111-1111-1111-111111111104', 'Репетиторство', 'tutoring', 'Навчання, уроки, курси', '📚', 'request'),
  ('11111111-1111-1111-1111-111111111105', 'Транспорт', 'transport', 'Перевезення, доставка, таксі', '🚗', 'request'),
  ('11111111-1111-1111-1111-111111111106', 'Краса та Здоров''я', 'beauty-health', 'Перукарні, масаж, косметика', '💆', 'request'),
  ('11111111-1111-1111-1111-111111111107', 'Юридичні послуги', 'legal', 'Консультації, документи, суди', '⚖️', 'request'),
  ('11111111-1111-1111-1111-111111111108', 'Прибирання', 'cleaning', 'Прибирання квартир та офісів', '🧹', 'request')
ON CONFLICT DO NOTHING;

-- Demo categories (offers)
INSERT INTO categories (id, name, slug, description, icon, type) VALUES
  ('22222222-2222-2222-2222-222222222201', 'IT та Програмування', 'it-programming-offer', 'Розробка програмного забезпечення, веб-сайтів, мобільних додатків', '💻', 'offer'),
  ('22222222-2222-2222-2222-222222222202', 'Дизайн', 'design-offer', 'Графічний дизайн, UI/UX, брендинг', '🎨', 'offer'),
  ('22222222-2222-2222-2222-222222222203', 'Ремонт та Будівництво', 'repair-construction-offer', 'Ремонт квартир, будівельні роботи', '🔧', 'offer'),
  ('22222222-2222-2222-2222-222222222204', 'Репетиторство', 'tutoring-offer', 'Навчання, уроки, курси', '📚', 'offer'),
  ('22222222-2222-2222-2222-222222222205', 'Транспорт', 'transport-offer', 'Перевезення, доставка, таксі', '🚗', 'offer'),
  ('22222222-2222-2222-2222-222222222206', 'Краса та Здоров''я', 'beauty-health-offer', 'Перукарні, масаж, косметика', '💆', 'offer'),
  ('22222222-2222-2222-2222-222222222207', 'Юридичні послуги', 'legal-offer', 'Консультації, документи, суди', '⚖️', 'offer'),
  ('22222222-2222-2222-2222-222222222208', 'Прибирання', 'cleaning-offer', 'Прибирання квартир та офісів', '🧹', 'offer')
ON CONFLICT DO NOTHING;

-- NOTE: Demo service_requests and service_offers require real auth.users entries.
-- To populate demo data, first create users via Supabase Dashboard > Authentication > Users,
-- then run INSERT statements like:
--
-- INSERT INTO service_requests (user_id, title, description, category_id, location, status, budget) VALUES
--   ('<user-id>', 'Потрібен веб-розробник', 'Опис запиту...', '11111111-1111-1111-1111-111111111101', 'Київ', 'active', '50000 грн');
--
-- INSERT INTO service_offers (user_id, title, description, category_id, location, status, price) VALUES
--   ('<user-id>', 'Розробка сайтів на React', 'Опис пропозиції...', '22222222-2222-2222-2222-222222222201', 'Київ', 'active', 'від 20000 грн');
