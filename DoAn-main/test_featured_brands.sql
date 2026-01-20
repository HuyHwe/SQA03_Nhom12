-- Test script for Featured Brands API
-- Run this to verify database setup

-- Check if organization table has required columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'organization' 
AND column_name IN ('id', 'name', 'avatar', 'industry', 'des', 'active')
ORDER BY column_name;

-- Check current data in organization table
SELECT id, name, avatar, industry, des, active 
FROM organization 
WHERE active = 1 
ORDER BY id;

-- Test the query used in findFeaturedBrands
SELECT o.id as id, o.name as name, o.avatar as avatar, o.industry as industry, o.des as description, COUNT(j.id) as postCount 
FROM organization o 
LEFT JOIN job j ON o.id = j.organizationid AND j.active = 1 
WHERE o.active = 1 
GROUP BY o.id, o.name, o.avatar, o.industry, o.des 
ORDER BY COUNT(j.id) DESC, o.id DESC
LIMIT 10;

-- Test categories query
SELECT DISTINCT o.industry 
FROM organization o 
WHERE o.active = 1 AND o.industry IS NOT NULL 
ORDER BY o.industry;

-- Check if there are any jobs linked to organizations
SELECT COUNT(*) as total_jobs, COUNT(DISTINCT organizationid) as organizations_with_jobs
FROM job 
WHERE active = 1 AND organizationid IS NOT NULL;
