-- Fix organization table - Add industry column and update data
-- Run this script to fix the database issues

-- Add industry column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'organization' AND column_name = 'industry') THEN
        ALTER TABLE organization ADD COLUMN industry VARCHAR(255);
    END IF;
END $$;

-- Add avatar column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'organization' AND column_name = 'avatar') THEN
        ALTER TABLE organization ADD COLUMN avatar VARCHAR(255);
    END IF;
END $$;

-- Update existing organizations with industry categories
UPDATE organization SET industry = 'IT - Phần mềm' WHERE id = 1;
UPDATE organization SET industry = 'IT - Phần mềm' WHERE id = 2;
UPDATE organization SET industry = 'IT - Phần mềm' WHERE id = 3;
UPDATE organization SET industry = 'Marketing' WHERE id = 4;
UPDATE organization SET industry = 'Tài chính' WHERE id = 5;
UPDATE organization SET industry = 'IT - Phần mềm' WHERE id = 6;
UPDATE organization SET industry = 'Tư vấn' WHERE id = 7;
UPDATE organization SET industry = 'Sản xuất' WHERE id = 8;
UPDATE organization SET industry = 'Nhân sự' WHERE id = 9;

-- Insert more sample organizations with different industries
INSERT INTO organization (id, name, avatar, des, industry, creationdate, updatedate, active)
VALUES
(10, 'VPBank', 'https://via.placeholder.com/100x100?text=VPBank', 'Ngân hàng TMCP Việt Nam Thịnh Vượng', 'Ngân hàng', NOW(), NOW(), 1),
(11, 'Techcombank', 'https://via.placeholder.com/100x100?text=Techcombank', 'Ngân hàng Kỹ thương Việt Nam', 'Ngân hàng', NOW(), NOW(), 1),
(12, 'THACO', 'https://via.placeholder.com/100x100?text=THACO', 'Tập đoàn THACO', 'Sản xuất', NOW(), NOW(), 1),
(13, 'Novaland', 'https://via.placeholder.com/100x100?text=Novaland', 'Tập đoàn Novaland', 'Bất động sản', NOW(), NOW(), 1),
(14, 'C.P. Group', 'https://via.placeholder.com/100x100?text=CP', 'Tập đoàn C.P.', 'Sản xuất', NOW(), NOW(), 1),
(15, 'AIA', 'https://via.placeholder.com/100x100?text=AIA', 'AIA Việt Nam', 'Bảo hiểm', NOW(), NOW(), 1),
(16, 'CMC Telecom', 'https://via.placeholder.com/100x100?text=CMC', 'CMC Telecom', 'IT - Phần mềm', NOW(), NOW(), 1),
(17, 'MB Bank', 'https://via.placeholder.com/100x100?text=MB', 'Ngân hàng Quân đội', 'Ngân hàng', NOW(), NOW(), 1),
(18, 'Novaon', 'https://via.placeholder.com/100x100?text=Novaon', 'Novaon Technology', 'IT - Phần mềm', NOW(), NOW(), 1),
(19, 'VINHOMES', 'https://via.placeholder.com/100x100?text=VINHOMES', 'Tập đoàn VINHOMES', 'Bất động sản', NOW(), NOW(), 1),
(20, 'Viettel', 'https://via.placeholder.com/100x100?text=Viettel', 'Tập đoàn Viettel', 'Viễn thông', NOW(), NOW(), 1),
(21, 'HOA PHAT', 'https://via.placeholder.com/100x100?text=HOAPHAT', 'Tập đoàn Hòa Phát', 'Sản xuất', NOW(), NOW(), 1),
(22, 'FPT', 'https://via.placeholder.com/100x100?text=FPT', 'Tập đoàn FPT', 'IT - Phần mềm', NOW(), NOW(), 1),
(23, 'BID GROUP', 'https://via.placeholder.com/100x100?text=BID', 'Tập đoàn BID', 'Đa ngành', NOW(), NOW(), 1)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    avatar = EXCLUDED.avatar,
    des = EXCLUDED.des,
    industry = EXCLUDED.industry,
    updatedate = NOW();

-- Update sequence for organization table
SELECT setval('organization_id_seq', (SELECT MAX(id) FROM organization));

-- Verify the data
SELECT id, name, industry, avatar FROM organization WHERE active = 1 ORDER BY id;
