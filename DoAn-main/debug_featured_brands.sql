-- Debug script for Featured Brands API
-- Run this to check database connection and data

-- 1. Check if organization table exists and has data
SELECT 'Organization table check' as test_name;
SELECT COUNT(*) as total_organizations FROM organization;
SELECT COUNT(*) as active_organizations FROM organization WHERE active = 1;

-- 2. Check if industry column exists
SELECT 'Industry column check' as test_name;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'organization' 
AND column_name = 'industry';

-- 3. Check if avatar column exists  
SELECT 'Avatar column check' as test_name;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'organization' 
AND column_name = 'avatar';

-- 4. Check current data in organization table
SELECT 'Current organization data' as test_name;
SELECT id, name, avatar, industry, des, active 
FROM organization 
ORDER BY id 
LIMIT 10;

-- 5. Test the exact query used in findFeaturedBrands
SELECT 'Test findFeaturedBrands query' as test_name;
SELECT o.id as id, o.name as name, o.avatar as avatar, o.industry as industry, o.des as description, COUNT(j.id) as postCount 
FROM organization o 
LEFT JOIN job j ON o.id = j.organizationid AND j.active = 1 
WHERE o.active = 1 
GROUP BY o.id, o.name, o.avatar, o.industry, o.des 
ORDER BY COUNT(j.id) DESC, o.id DESC
LIMIT 5;

-- 6. Test categories query
SELECT 'Test categories query' as test_name;
SELECT DISTINCT o.industry 
FROM organization o 
WHERE o.active = 1 AND o.industry IS NOT NULL 
ORDER BY o.industry;

-- 7. Check if there are any jobs linked to organizations
SELECT 'Job-Organization relationship check' as test_name;
SELECT COUNT(*) as total_jobs, COUNT(DISTINCT organizationid) as organizations_with_jobs
FROM job 
WHERE active = 1 AND organizationid IS NOT NULL;

-- 8. Check specific organization data
SELECT 'Specific organization data' as test_name;
SELECT id, name, avatar, industry, des, active 
FROM organization 
WHERE name LIKE '%Tech%' OR name LIKE '%Bank%' OR name LIKE '%FPT%'
ORDER BY id;
