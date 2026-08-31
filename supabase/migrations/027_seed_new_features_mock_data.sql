-- =============================================================================
-- Migration: 027_seed_new_features_mock_data.sql
-- Description:
--   Seeds mock data for the 3 features added in PR #31 (issues #28/#29/#30),
--   following 016_seed_mock_data.sql's pattern, so their screens render real
--   content instead of an empty state:
--
--   - Boosts 2 of 016's existing SELL listings (is_advertised/advertised_at)
--     so Home's Sponsored section has content.
--   - Sets job_category on 016's existing 2 job_posts.
--   - Adds 2 new mock Packers & Movers vendor profiles (own auth.users rows,
--     same technique as 016) with category tags, plus one Machine Lifting
--     and one Shop Lifting requirement posted by 2 of 016's existing mock
--     profiles (reused, since posting a lifting requirement doesn't need a
--     dedicated persona the way offering the service does).
--
--   Depends on 016_seed_mock_data.sql having already run (reuses its
--   profile/listing/job_post ids) and on 025_packers_movers.sql /
--   024_job_posts_category.sql / 023_marketplace_advertising.sql.
-- =============================================================================

BEGIN;

-- =============================================================================
-- Boost 2 existing SELL listings (Sponsored section on Home)
-- =============================================================================

UPDATE marketplace_listings
SET is_advertised = TRUE, advertised_at = NOW() - INTERVAL '1 day'
WHERE id = '04db6952-b8c2-40d8-8e34-6c11852caa2d'; -- Used CNC Lathe Machine – Well Maintained

UPDATE marketplace_listings
SET is_advertised = TRUE, advertised_at = NOW()
WHERE id = '5927b0d2-8216-44b1-9ddf-c7c148702e62'; -- CNC Hydraulic Press Brake – 3 Meter Bed

-- =============================================================================
-- Job post role types
-- =============================================================================

UPDATE job_posts SET job_category = 'Operator'
WHERE id = '829d9f7c-ee28-4ba1-9fdf-edb7366c5605'; -- Hiring: CNC Machine Operator

UPDATE job_posts SET job_category = 'Technician'
WHERE id = '20df180a-53c0-477d-b552-3cdb68ec3170'; -- Hiring: Machine Maintenance Technician

-- =============================================================================
-- Mock auth.users + profile stubs for 2 Packers & Movers vendors
-- =============================================================================

INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES
    ('00000000-0000-0000-0000-000000000000', 'fcc4513b-7ce4-4484-80e3-b6bb23477e80', 'authenticated', 'authenticated',
     'mock+bangaloresafemovers@example.com', NULL, NOW(),
     '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Bangalore Safe Movers & Packers"}'::jsonb, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000000', '210505d8-a157-4b98-8da2-0e1b9e3c6be1', 'authenticated', 'authenticated',
     'mock+omlogisticsmachinemovers@example.com', NULL, NOW(),
     '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Om Logistics & Machine Movers"}'::jsonb, NOW(), NOW());

UPDATE profiles SET company_name = 'Bangalore Safe Movers & Packers', city = 'Bangalore', state = 'Karnataka',
    about = 'Specialist heavy machine and factory relocation service — cranes, forklifts, and a trained rigging crew. Based in Peenya, serving all of Bangalore.',
    website = NULL, interests = '{}', onboarded_at = NOW()
    WHERE id = 'fcc4513b-7ce4-4484-80e3-b6bb23477e80';
UPDATE profiles SET company_name = 'Om Logistics & Machine Movers', city = 'Bangalore', state = 'Karnataka',
    about = 'Full workshop and machine shifting service, including packing, transport, and re-installation. 10+ years relocating industrial units across Karnataka.',
    website = 'www.omlogisticsmovers.in', interests = '{}', onboarded_at = NOW()
    WHERE id = '210505d8-a157-4b98-8da2-0e1b9e3c6be1';

-- =============================================================================
-- Packers & Movers capabilities (vendors) + category tags
-- =============================================================================

INSERT INTO packers_movers_capabilities (profile_id, title, description, city, state, is_active)
VALUES
    ('fcc4513b-7ce4-4484-80e3-b6bb23477e80', 'Bangalore Safe Movers & Packers',
     'Heavy machine lifting and relocation with cranes and hydraulic trolleys. Rigging crew experienced with CNC machines, presses, and compressors. Based in Peenya.',
     'Bangalore', 'Karnataka', TRUE),
    ('210505d8-a157-4b98-8da2-0e1b9e3c6be1', 'Om Logistics & Machine Movers',
     'End-to-end factory and workshop relocation — dismantling, packing, transport, and re-installation at the new site. Serving Bangalore and nearby industrial towns.',
     'Bangalore', 'Karnataka', TRUE);

INSERT INTO packers_movers_capability_categories (profile_id, machine_category_id)
VALUES
    ('fcc4513b-7ce4-4484-80e3-b6bb23477e80', '6fdaa1d1-1ba1-52ee-80dd-e063cbd61d3d'), -- Metal Working Machines
    ('fcc4513b-7ce4-4484-80e3-b6bb23477e80', '47cee8b4-8318-50ab-b15e-865512d319c2'), -- Material Handling Equipments
    ('210505d8-a157-4b98-8da2-0e1b9e3c6be1', '6fdaa1d1-1ba1-52ee-80dd-e063cbd61d3d'), -- Metal Working Machines
    ('210505d8-a157-4b98-8da2-0e1b9e3c6be1', '0bc6905e-89cb-5187-af2d-e2fc6f9ea665'); -- Construction Machines

-- =============================================================================
-- Packers & Movers requirements (posted by 2 of 016's existing mock profiles)
-- =============================================================================

INSERT INTO packers_movers_requirements (id, profile_id, request_type, machine_category_id, title, description, pickup_city, pickup_state, drop_city, drop_state, status)
VALUES
    ('8a0efac0-0f1a-407a-af7c-510a59f03dcc', '5919feae-818f-4502-8c4c-11e87145bc2f',
     'MACHINE_LIFTING', '011ddcfb-078b-5d7c-9583-ac97ced0fe33', 'Need CNC Lathe Shifted to New Unit',
     'Relocating one CNC lathe (approx 3 tonnes) from our Bommasandra facility to a new unit nearby. Need crane/hydraulic trolley and safe loading — machine is operational and should not be damaged.',
     'Bangalore', 'Karnataka', 'Bangalore', 'Karnataka', 'ACTIVE'),
    ('79ff61e1-618c-471e-ab5a-184d28868397', '8e2eee98-b940-423f-ac86-f949ce17b092',
     'SHOP_LIFTING', NULL, 'Full Packaging Unit Relocation – Jigani to Electronic City',
     'Shifting our entire food packaging unit (approx 3000 sq ft, 6 machines plus racking and inventory) from Jigani to a new facility in Electronic City. Looking for an experienced crew and possibly a weekend move to minimize downtime.',
     'Bangalore', 'Karnataka', 'Bangalore', 'Karnataka', 'ACTIVE');

COMMIT;
