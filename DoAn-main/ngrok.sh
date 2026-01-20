#!/bin/bash

# =============================================================================
# NGROK SETUP SCRIPT FOR LINUX
# Script để cài đặt, cấu hình và chạy ngrok cho Linux
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== NGROK SETUP FOR LINUX ===${NC}"

# Step 1: Download and install ngrok
echo -e "${YELLOW}Bước 1: Tải và cài đặt ngrok...${NC}"

# Detect architecture
ARCH=$(uname -m)
if [ "$ARCH" = "x86_64" ]; then
    ARCH="amd64"
elif [ "$ARCH" = "aarch64" ]; then
    ARCH="arm64"
fi

# Download ngrok
NGROK_URL="https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-${ARCH}.tgz"
echo "Đang tải ngrok từ: $NGROK_URL"

curl -L -o ngrok.tgz "$NGROK_URL"
tar -xzf ngrok.tgz
sudo mv ngrok /usr/local/bin/
rm ngrok.tgz

echo -e "${GREEN}✓ Cài đặt ngrok thành công!${NC}"

# Step 2: Setup auth token
echo -e "${YELLOW}Bước 2: Cấu hình auth token...${NC}"
echo "Để lấy auth token:"
echo "1. Truy cập: https://ngrok.com/"
echo "2. Đăng ký/đăng nhập tài khoản"
echo "3. Vào dashboard để lấy auth token"
echo ""

read -p "Nhập auth token của bạn: " AUTH_TOKEN

if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${RED}Auth token không được để trống!${NC}"
    exit 1
fi

ngrok config add-authtoken "$AUTH_TOKEN"
echo -e "${GREEN}✓ Cấu hình auth token thành công!${NC}"

# Step 3: Run ngrok
echo -e "${YELLOW}Bước 3: Chạy ngrok tunnel...${NC}"
read -p "Nhập port number (mặc định: 2000): " PORT
PORT=${PORT:-2000}

echo ""
echo -e "${YELLOW}QUAN TRỌNG:${NC}"
echo "1. Sau khi ngrok chạy, copy URL 'Forwarding'"
echo "2. Cập nhật vào file application-dev.properties trong payment-service"
echo "3. Ví dụ: MOMO_IPN_URL=https://abc123.ngrok.io/api/payment/momo/ipn"
echo ""
echo "Nhấn Ctrl+C để dừng ngrok"
echo ""

# Start ngrok
ngrok http "$PORT"
