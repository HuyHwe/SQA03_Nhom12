-- Tạo role 'admin' nếu chưa tồn tại
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'admin') THEN
CREATE ROLE admin WITH LOGIN PASSWORD 'juile2022' CREATEDB;
END IF;
END
$$;

-- Tạo database 'jober_test' nếu chưa tồn tại, và gán owner là 'admin'
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'jober_test') THEN
      CREATE DATABASE jober_test OWNER admin;
END IF;
END
$$;

-- Kết nối đến database 'jober_test' để gán quyền
\connect jober_test

-- Gán toàn bộ quyền truy cập cho role 'admin'
GRANT ALL PRIVILEGES ON DATABASE jober_test TO admin;
