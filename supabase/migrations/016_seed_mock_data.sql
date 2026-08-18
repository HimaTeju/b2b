-- =============================================================================
-- Migration: 016_seed_mock_data.sql
-- Description:
--   Seeds 12 realistic, Bangalore-based mock profiles and 2 rows in every
--   domain table (marketplace_listings SELL, marketplace_listings
--   REQUIREMENT, service_capabilities, service_requirements, job_posts,
--   job_seeker_profiles, jobwork_capabilities, jobwork_requirements,
--   enquiries) so every browse/list screen renders real content instead of
--   an empty state. Category IDs are hardcoded from 009_seed_machine_categories.sql
--   rather than looked up by name, since several category names are not
--   globally unique (name is only unique per (parent_id, name), and a few
--   have trailing whitespace, e.g. 'Press Brake Machines ').
--
--   Since profiles.id is a hard FK to auth.users(id), and on_auth_user_created
--   auto-creates a bare profiles(id) stub for every new auth.users row, mock
--   profiles are created by inserting into auth.users first (minimal columns;
--   token columns explicitly set to '' rather than left NULL, since GoTrue
--   scans them as non-nullable strings and a NULL there breaks Supabase
--   Studio's Auth > Users page for all users, not just the mock ones), then
--   updating the auto-created stub rows with mock company/profile details.
--
--   listing_images is intentionally not seeded: ListingCard.jsx never
--   renders listing images (hardcoded placeholder glyph) and this project
--   has no Supabase Storage bucket, so storage_path values would be dead
--   data.
--
--   Two profiles (Precision CNC Traders, Manjunath R) get a real login
--   password so the private, auth.uid()-scoped screens (Home, Dashboard,
--   Profile, Enquiries) can be verified live in the browser, not just via
--   SQL. Password hash was pre-computed via a standalone
--   `SELECT crypt('<password>', gen_salt('bf'))` query so the plaintext
--   password itself is never committed to this file.
-- =============================================================================

BEGIN;

-- =============================================================================
-- Mock auth.users + profile stubs
-- =============================================================================

INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES
    ('00000000-0000-0000-0000-000000000000', '067559e3-7a50-40b7-b008-08989f5a59ca', 'authenticated', 'authenticated',
     'mock+precisioncnc@example.com', '$2a$06$a2ghddrhQ4fvTlhBoMJxZOaJABYzXBUt/ju1s8rCEFZDVk.2Az2Py', NOW(),
     '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Precision CNC Traders"}'::jsonb, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', '7d9b22c7-7f18-4fcf-9fdf-cb2a45bd97af', 'authenticated', 'authenticated',
     'mock+bangaloremachinery@example.com', NULL, NOW(),
     '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Bangalore Machinery Exports"}'::jsonb, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', '5919feae-818f-4502-8c4c-11e87145bc2f', 'authenticated', 'authenticated',
     'mock+sundaramauto@example.com', NULL, NOW(),
     '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Sundaram Auto Components Pvt Ltd"}'::jsonb, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', '8e2eee98-b940-423f-ac86-f949ce17b092', 'authenticated', 'authenticated',
     'mock+karnatakafoodpkg@example.com', NULL, NOW(),
     '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Karnataka Food Packaging Co"}'::jsonb, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', 'c736e879-8452-427b-b514-2e17c0c0bd42', 'authenticated', 'authenticated',
     'mock+reliablemaintenance@example.com', NULL, NOW(),
     '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Reliable Industrial Maintenance Services"}'::jsonb, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', '5ae07d88-d08f-41a4-8477-63723a67d843', 'authenticated', 'authenticated',
     'mock+precisioncalibration@example.com', NULL, NOW(),
     '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Precision Calibration & Instrumentation"}'::jsonb, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', '10614a34-5372-4c44-a266-6d02d1445536', 'authenticated', 'authenticated',
     'mock+srilakshmieng@example.com', NULL, NOW(),
     '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Sri Lakshmi Engineering Industries"}'::jsonb, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', '1d020374-c41a-4ffa-8479-1bcf643bf8cf', 'authenticated', 'authenticated',
     'mock+vishwaplastics@example.com', NULL, NOW(),
     '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Vishwa Plastics Pvt Ltd"}'::jsonb, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', '0a2d5a00-8a49-4b39-8d93-b2fe81909ccd', 'authenticated', 'authenticated',
     'mock+omsaicncjobworks@example.com', NULL, NOW(),
     '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Om Sai CNC Job Works"}'::jsonb, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', '3a2fae01-6a5b-4ed8-89cc-11b0e8211c90', 'authenticated', 'authenticated',
     'mock+chandrasheetmetal@example.com', NULL, NOW(),
     '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Chandra Sheet Metal Fabricators"}'::jsonb, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', 'f1464171-9e51-4122-9e05-801af124782f', 'authenticated', 'authenticated',
     'mock+sureshkumar@example.com', NULL, NOW(),
     '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Suresh Kumar"}'::jsonb, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', 'd5e0d72d-b68a-4194-af1d-e8a89055b110', 'authenticated', 'authenticated',
     'mock+manjunathr@example.com', '$2a$06$a2ghddrhQ4fvTlhBoMJxZOaJABYzXBUt/ju1s8rCEFZDVk.2Az2Py', NOW(),
     '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Manjunath R"}'::jsonb, NOW(), NOW());

-- Fill in the profile stubs auto-created by on_auth_user_created

UPDATE profiles SET company_name = 'Precision CNC Traders', city = 'Bangalore', state = 'Karnataka',
    about = 'Trader and reseller of used and refurbished CNC machinery, based in Peenya Industrial Area. Serving small and medium manufacturing units across Bangalore.',
    website = 'www.precisioncnctraders.in', interests = '{marketplace,jobs}', onboarded_at = NOW()
    WHERE id = '067559e3-7a50-40b7-b008-08989f5a59ca';
UPDATE profiles SET company_name = 'Bangalore Machinery Exports', city = 'Bangalore', state = 'Karnataka',
    about = 'Dealer in industrial sheet metal and metal working machinery, operating out of Yeshwanthpur. Domestic sales and machine exports.',
    website = 'www.bangaloremachineryexports.com', interests = '{marketplace}', onboarded_at = NOW()
    WHERE id = '7d9b22c7-7f18-4fcf-9fdf-cb2a45bd97af';
UPDATE profiles SET company_name = 'Sundaram Auto Components Pvt Ltd', city = 'Bangalore', state = 'Karnataka',
    about = 'Manufacturer of precision auto components for OEMs, based in Bommasandra Industrial Area.',
    website = 'www.sundaramautocomponents.in', interests = '{marketplace,jobs}', onboarded_at = NOW()
    WHERE id = '5919feae-818f-4502-8c4c-11e87145bc2f';
UPDATE profiles SET company_name = 'Karnataka Food Packaging Co', city = 'Bangalore', state = 'Karnataka',
    about = 'Contract food packaging unit serving FMCG brands across Karnataka, located in Jigani.',
    website = NULL, interests = '{marketplace,jobwork}', onboarded_at = NOW()
    WHERE id = '8e2eee98-b940-423f-ac86-f949ce17b092';
UPDATE profiles SET company_name = 'Reliable Industrial Maintenance Services', city = 'Bangalore', state = 'Karnataka',
    about = 'AMC and breakdown maintenance service provider for CNC machines, compressors, and factory utilities. 15+ years serving the Rajajinagar and Peenya industrial belt.',
    website = 'www.reliableindustrialservices.in', interests = '{services}', onboarded_at = NOW()
    WHERE id = 'c736e879-8452-427b-b514-2e17c0c0bd42';
UPDATE profiles SET company_name = 'Precision Calibration & Instrumentation', city = 'Bangalore', state = 'Karnataka',
    about = 'ISO-traceable calibration services for industrial instruments, based in Electronic City. On-site and lab calibration available.',
    website = 'www.precisioncalibration.in', interests = '{services}', onboarded_at = NOW()
    WHERE id = '5ae07d88-d08f-41a4-8477-63723a67d843';
UPDATE profiles SET company_name = 'Sri Lakshmi Engineering Industries', city = 'Bangalore', state = 'Karnataka',
    about = 'General engineering and fabrication unit on Hosur Road, manufacturing machine parts and structural assemblies.',
    website = NULL, interests = '{services,jobwork}', onboarded_at = NOW()
    WHERE id = '10614a34-5372-4c44-a266-6d02d1445536';
UPDATE profiles SET company_name = 'Vishwa Plastics Pvt Ltd', city = 'Bangalore', state = 'Karnataka',
    about = 'Plastic injection molding unit based in Nelamangala, producing components for industrial and consumer goods.',
    website = 'www.vishwaplastics.in', interests = '{services}', onboarded_at = NOW()
    WHERE id = '1d020374-c41a-4ffa-8479-1bcf643bf8cf';
UPDATE profiles SET company_name = 'Om Sai CNC Job Works', city = 'Bangalore', state = 'Karnataka',
    about = 'CNC turning and milling job work for auto components and general engineering parts, located in Peenya 2nd Stage. Batch and prototype orders welcome.',
    website = NULL, interests = '{jobwork}', onboarded_at = NOW()
    WHERE id = '0a2d5a00-8a49-4b39-8d93-b2fe81909ccd';
UPDATE profiles SET company_name = 'Chandra Sheet Metal Fabricators', city = 'Bangalore', state = 'Karnataka',
    about = 'Laser cutting, bending, and welding job work for sheet metal parts, near Bidadi. Serving Bangalore and Ramanagara units.',
    website = NULL, interests = '{jobwork}', onboarded_at = NOW()
    WHERE id = '3a2fae01-6a5b-4ed8-89cc-11b0e8211c90';
UPDATE profiles SET company_name = 'Suresh Kumar', city = 'Bangalore', state = 'Karnataka',
    about = 'CNC lathe and milling operator with a background in auto components manufacturing. Based in Whitefield.',
    website = NULL, interests = '{jobs}', onboarded_at = NOW()
    WHERE id = 'f1464171-9e51-4122-9e05-801af124782f';
UPDATE profiles SET company_name = 'Manjunath R', city = 'Bangalore', state = 'Karnataka',
    about = 'Mechanical maintenance technician experienced with CNC machines, air compressors, and factory utilities. Based in Marathahalli.',
    website = NULL, interests = '{jobs}', onboarded_at = NOW()
    WHERE id = 'd5e0d72d-b68a-4194-af1d-e8a89055b110';

-- =============================================================================
-- Marketplace listings (2 SELL, 2 REQUIREMENT)
-- =============================================================================

INSERT INTO marketplace_listings (id, profile_id, machine_category_id, intent, title, description, condition, price, quantity, city, state, status)
VALUES
    ('04db6952-b8c2-40d8-8e34-6c11852caa2d', '067559e3-7a50-40b7-b008-08989f5a59ca',
     '011ddcfb-078b-5d7c-9583-ac97ced0fe33', 'SELL', 'Used CNC Lathe Machine – Well Maintained',
     '8-inch chuck CNC lathe, single owner, running condition, recently serviced. Suitable for small to medium turning jobs. Available for inspection at our Peenya facility.',
     'USED', 450000.00, 1, 'Bangalore', 'Karnataka', 'ACTIVE'),
    ('5927b0d2-8216-44b1-9ddf-c7c148702e62', '7d9b22c7-7f18-4fcf-9fdf-cb2a45bd97af',
     '504cc336-463b-561f-96bb-374f36bd0a4f', 'SELL', 'CNC Hydraulic Press Brake – 3 Meter Bed',
     '3-meter CNC press brake with programmable back gauge, 2022 model, low usage. Ideal for sheet metal fabrication units. Located in Yeshwanthpur, transport within Bangalore can be arranged.',
     'USED', 1250000.00, 1, 'Bangalore', 'Karnataka', 'ACTIVE'),
    ('bdddbc4e-1baf-4d99-8859-95d52827ca25', '5919feae-818f-4502-8c4c-11e87145bc2f',
     'd40e62af-fa55-5c19-bd8b-df625c79a74e', 'REQUIREMENT', 'Require VMC Machine for Auto Components Unit',
     'Looking to procure a used or new VMC (Vertical Machining Centre) with at least 500mm X-travel for our Bommasandra facility. Please share specifications and pricing.',
     NULL, NULL, 1, 'Bangalore', 'Karnataka', 'ACTIVE'),
    ('4c5c34a3-909d-408e-b82f-249ab44449d3', '8e2eee98-b940-423f-ac86-f949ce17b092',
     'ed7bfc96-7098-508d-9cb1-f076d85b155d', 'REQUIREMENT', 'Need Automatic Pouch Packaging Machine',
     'Require an automatic pouch packaging machine for our food packaging unit in Jigani, capacity around 40-60 pouches/min. Prefer suppliers based in or near Bangalore for easy servicing.',
     NULL, NULL, 1, 'Bangalore', 'Karnataka', 'ACTIVE');

-- =============================================================================
-- Service capabilities (providers) + category tags
-- =============================================================================

INSERT INTO service_capabilities (profile_id, title, description, city, state, is_active)
VALUES
    ('c736e879-8452-427b-b514-2e17c0c0bd42', 'Industrial Machine AMC & Breakdown Maintenance',
     'We provide annual maintenance contracts and breakdown repair services for CNC machines, compressors, and general industrial equipment across Bangalore. 15+ years serving the Rajajinagar and Peenya industrial belt.',
     'Bangalore', 'Karnataka', TRUE),
    ('5ae07d88-d08f-41a4-8477-63723a67d843', 'Precision Calibration & Instrumentation Services',
     'ISO-traceable calibration for pressure gauges, torque wrenches, dial gauges, and industrial instruments. On-site and lab calibration available across Bangalore, based out of Electronic City.',
     'Bangalore', 'Karnataka', TRUE);

INSERT INTO service_capability_categories (profile_id, machine_category_id)
VALUES
    ('c736e879-8452-427b-b514-2e17c0c0bd42', '6fdaa1d1-1ba1-52ee-80dd-e063cbd61d3d'),
    ('c736e879-8452-427b-b514-2e17c0c0bd42', '9ea43a06-282e-5f0a-ade3-329b9fdd44b9'),
    ('5ae07d88-d08f-41a4-8477-63723a67d843', '9ea43a06-282e-5f0a-ade3-329b9fdd44b9');

-- =============================================================================
-- Job work capabilities (vendors) + category tags
-- =============================================================================

INSERT INTO jobwork_capabilities (profile_id, title, description, city, state, is_active)
VALUES
    ('0a2d5a00-8a49-4b39-8d93-b2fe81909ccd', 'CNC Machining Job Work – Turning & Milling',
     'Precision CNC turning and milling job work for auto components and general engineering parts. Quick turnaround, batch and prototype orders welcome. Located in Peenya 2nd Stage.',
     'Bangalore', 'Karnataka', TRUE),
    ('3a2fae01-6a5b-4ed8-89cc-11b0e8211c90', 'Sheet Metal Fabrication Job Work',
     'Laser cutting, bending, and welding job work for sheet metal parts. In-house press brake and CNC laser cutting setup near Bidadi, serving Bangalore and Ramanagara units.',
     'Bangalore', 'Karnataka', TRUE);

INSERT INTO jobwork_capability_categories (profile_id, machine_category_id)
VALUES
    ('0a2d5a00-8a49-4b39-8d93-b2fe81909ccd', 'fcd2fe94-3f13-5ad5-9fc7-4be2dcecbd2d'),
    ('0a2d5a00-8a49-4b39-8d93-b2fe81909ccd', '011ddcfb-078b-5d7c-9583-ac97ced0fe33'),
    ('3a2fae01-6a5b-4ed8-89cc-11b0e8211c90', '0f3b5f3a-9d12-5036-8a87-2310383e1391');

-- =============================================================================
-- Job seeker profiles + category tags
-- =============================================================================

INSERT INTO job_seeker_profiles (profile_id, headline, about, experience_years, resume_url, city, state, is_active)
VALUES
    ('f1464171-9e51-4122-9e05-801af124782f', 'CNC Machine Operator – 4 Years Experience',
     'Experienced CNC lathe and milling operator with a background in auto components manufacturing. Comfortable reading engineering drawings and handling Fanuc controls. Based in Whitefield, open to work across Bangalore.',
     4, NULL, 'Bangalore', 'Karnataka', TRUE),
    ('d5e0d72d-b68a-4194-af1d-e8a89055b110', 'Industrial Machine Maintenance Technician – 6 Years Experience',
     'Mechanical maintenance technician with experience servicing CNC machines, air compressors, and factory utilities. Previously worked with a Peenya-based engineering unit. Based in Marathahalli.',
     6, NULL, 'Bangalore', 'Karnataka', TRUE);

INSERT INTO job_seeker_categories (profile_id, machine_category_id)
VALUES
    ('f1464171-9e51-4122-9e05-801af124782f', '011ddcfb-078b-5d7c-9583-ac97ced0fe33'),
    ('f1464171-9e51-4122-9e05-801af124782f', 'fcd2fe94-3f13-5ad5-9fc7-4be2dcecbd2d'),
    ('d5e0d72d-b68a-4194-af1d-e8a89055b110', '9ea43a06-282e-5f0a-ade3-329b9fdd44b9'),
    ('d5e0d72d-b68a-4194-af1d-e8a89055b110', '6fdaa1d1-1ba1-52ee-80dd-e063cbd61d3d');

-- =============================================================================
-- Service requirements
-- =============================================================================

INSERT INTO service_requirements (id, profile_id, machine_category_id, title, description, city, state, status)
VALUES
    ('25b51296-2fa2-4bd5-8d18-88f5fe040c29', '10614a34-5372-4c44-a266-6d02d1445536',
     '61ad7059-ea1a-5dd9-8885-99f6dbf1b8e7', 'Need AMC for Industrial Air Compressors',
     'Looking for an annual maintenance contract for 3 industrial air compressors at our Hosur Road facility. Require quarterly servicing and emergency breakdown support.',
     'Bangalore', 'Karnataka', 'ACTIVE'),
    ('010b39e4-89bd-4c58-a662-ac4ddd58f210', '1d020374-c41a-4ffa-8479-1bcf643bf8cf',
     'd93a5a1a-f2de-53a4-a716-1a01cb86b9e0', 'Installation & Commissioning Service Needed for Injection Molding Machine',
     'Recently purchased a used injection molding machine for our Nelamangala unit and need professional installation, electrical hookup, and commissioning support.',
     'Bangalore', 'Karnataka', 'ACTIVE');

-- =============================================================================
-- Job work requirements
-- =============================================================================

INSERT INTO jobwork_requirements (id, profile_id, machine_category_id, title, description, city, state, status)
VALUES
    ('0bdb8f8c-ef4a-4537-850f-a79dbb597e41', '10614a34-5372-4c44-a266-6d02d1445536',
     'fcd2fe94-3f13-5ad5-9fc7-4be2dcecbd2d', 'Looking for CNC Machining Job Work Vendor',
     'Need a reliable job work vendor for CNC milling of mild steel brackets, approx 500 pieces/month. Vendor should be located within Bangalore for easy pickup/delivery.',
     'Bangalore', 'Karnataka', 'ACTIVE'),
    ('d917e13c-8bd1-4f95-94f8-b6dade5300cd', '8e2eee98-b940-423f-ac86-f949ce17b092',
     '0f3b5f3a-9d12-5036-8a87-2310383e1391', 'Need Sheet Metal Job Work for Packaging Line Frames',
     'Require sheet metal cutting and bending job work for fabricating equipment frames for our packaging line. Ongoing requirement, based in Jigani.',
     'Bangalore', 'Karnataka', 'ACTIVE');

-- =============================================================================
-- Job posts
-- =============================================================================

INSERT INTO job_posts (id, profile_id, machine_category_id, title, description, city, state, status)
VALUES
    ('829d9f7c-ee28-4ba1-9fdf-edb7366c5605', '5919feae-818f-4502-8c4c-11e87145bc2f',
     '101d8499-11ba-5411-a0dd-dc35f21c67af', 'Hiring: CNC Machine Operator',
     'We are hiring an experienced CNC machine operator for our Bommasandra facility. Should be comfortable with Fanuc/Siemens controls and reading engineering drawings. Immediate joining preferred.',
     'Bangalore', 'Karnataka', 'ACTIVE'),
    ('20df180a-53c0-477d-b552-3cdb68ec3170', '067559e3-7a50-40b7-b008-08989f5a59ca',
     '6fdaa1d1-1ba1-52ee-80dd-e063cbd61d3d', 'Hiring: Machine Maintenance Technician',
     'Looking for a maintenance technician to handle upkeep of CNC machines and compressors at our Peenya facility. 3+ years of relevant experience preferred.',
     'Bangalore', 'Karnataka', 'ACTIVE');

-- =============================================================================
-- Enquiries (exactly one reference column set per row)
-- =============================================================================

INSERT INTO enquiries (id, from_profile_id, to_profile_id, job_post_id, message, is_read)
VALUES
    ('4861d052-8c33-4925-a495-d46b44017340', 'd5e0d72d-b68a-4194-af1d-e8a89055b110', '067559e3-7a50-40b7-b008-08989f5a59ca',
     '20df180a-53c0-477d-b552-3cdb68ec3170',
     'Hi, I have 6 years of experience maintaining CNC machines and industrial compressors, most recently with a Peenya-based engineering unit. I''d like to apply for the Machine Maintenance Technician role — happy to share references and discuss availability.',
     FALSE);

INSERT INTO enquiries (id, from_profile_id, to_profile_id, service_requirement_id, message, is_read)
VALUES
    ('b35c9edf-16db-4d3d-9b0e-5233657ca1ac', 'c736e879-8452-427b-b514-2e17c0c0bd42', '10614a34-5372-4c44-a266-6d02d1445536',
     '25b51296-2fa2-4bd5-8d18-88f5fe040c29',
     'We provide AMC and breakdown support for industrial air compressors across Bangalore, including the Hosur Road belt. We''d be happy to send a quote for quarterly servicing of your 3 compressors — please let us know a convenient time for a site visit.',
     FALSE);

COMMIT;
