# 📸 Web Upload Hình Ảnh Đơn Giản

Web application cực kỳ đơn giản để upload và quản lý hình ảnh với Docker, HTTPS tự động qua Traefik, và dễ dàng deploy trên bất kỳ server nào.

## ✨ Tính Năng

- ✅ Upload hình ảnh (JPG, JPEG, PNG) - tối đa 10MB
- ✅ Drag & drop để upload
- ✅ Preview ảnh trước khi upload
- ✅ Tạo link public cho mỗi ảnh
- ✅ Copy link nhanh chóng
- ✅ Lịch sử upload (lưu trong browser)
- ✅ Giao diện đẹp, hiện đại
- ✅ HTTPS tự động với Let's Encrypt
- ✅ Responsive trên mọi thiết bị

## 🏗️ Kiến Trúc

```
┌─────────────────────────────────────────┐
│         Internet (HTTPS/HTTP)            │
└────────────────┬────────────────────────┘
                 │
         ┌───────▼────────┐
         │    Traefik      │ ← Reverse Proxy
         │  (Port 80/443)  │ ← HTTPS Auto (Let's Encrypt)
         └───────┬────────┘
                 │
         ┌───────▼────────┐
         │  Express App    │ ← HTTP Only (Port 3000)
         │   (Node.js)     │
         └───────┬────────┘
                 │
         ┌───────▼────────┐
         │  /app/uploads   │ ← Volume Mount
         │  (Host Storage) │ ← Persist Images
         └─────────────────┘
```

**Ưu điểm**:
- App chỉ lo HTTP, đơn giản hơn
- Traefik tự động xử lý HTTPS, renew SSL
- Ảnh lưu trên host, không mất khi restart container
- Chuyển máy chỉ cần copy folder `uploads/`

## 📋 Yêu Cầu Hệ Thống

- **Docker** và **Docker Compose** đã cài đặt
- **Port 80 và 443** phải mở (cho HTTP/HTTPS)
- **Domain** đã trỏ DNS A record về IP server

## 🚀 Cài Đặt & Deploy

### Bước 1: Chuẩn Bị

```bash
# Clone hoặc copy project về server
cd simple-image-upload
```

### Bước 2: Cấu Hình Domain

```bash
# Copy file .env.example thành .env
cp .env.example .env

# Chỉnh sửa file .env
nano .env
```

**Nội dung file `.env`**:
```env
DOMAIN=yourdomain.com
EMAIL=your-email@example.com
```

> **Lưu ý**: 
> - `DOMAIN`: Domain của bạn (ví dụ: `images.example.com`)
> - `EMAIL`: Email để nhận thông báo từ Let's Encrypt

### Bước 3: Trỏ DNS

Tạo **A Record** trong DNS của domain trỏ về IP server:

```
Type: A
Name: @ (hoặc subdomain)
Value: <IP_SERVER>
TTL: 300 (hoặc auto)
```

**Kiểm tra DNS**:
```bash
nslookup yourdomain.com
# Hoặc
ping yourdomain.com
```

### Bước 4: Chạy Docker

```bash
# Build và start containers
docker compose up -d

# Xem logs
docker compose logs -f

# Kiểm tra status
docker compose ps
```

### Bước 5: Truy Cập

Mở trình duyệt và truy cập:
- **App**: `https://yourdomain.com`
- **Traefik Dashboard** (optional): `http://yourdomain.com:8080`

> **Chú ý**: Lần đầu tiên có thể mất 1-2 phút để Traefik tạo SSL certificate.

## 🔄 Chuyển Sang Máy Khác

### Cách 1: Copy Toàn Bộ Project (Bao Gồm Ảnh)

```bash
# Trên máy cũ: Stop containers
docker compose down

# Copy toàn bộ folder sang máy mới
scp -r simple-image-upload user@new-server:/path/to/destination

# Trên máy mới:
cd simple-image-upload

# Cập nhật DNS trỏ về IP máy mới
# Sau đó start
docker compose up -d
```

### Cách 2: Chỉ Copy Code (Không Copy Ảnh)

```bash
# Trên máy mới:
# Copy project (không có folder uploads/)

# Tạo folder uploads rỗng
mkdir uploads

# Chỉnh file .env (giữ nguyên domain hoặc đổi nếu cần)
nano .env

# Cập nhật DNS
# Start
docker compose up -d
```

### Cách 3: Git Clone (Recommended)

```bash
# Push lên Git (lần đầu)
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-git-repo>
git push -u origin main

# Trên máy mới:
git clone <your-git-repo>
cd simple-image-upload
cp .env.example .env
nano .env  # Điền domain và email
docker compose up -d
```

> **Lưu ý**: File `.env` và folder `uploads/` không được push lên Git (đã có trong `.gitignore`)

## 📁 Cấu Trúc Thư Mục

```
simple-image-upload/
├── app/
│   ├── server.js              # Express server (main app)
│   ├── package.json           # Node dependencies
│   └── public/
│       └── index.html         # Frontend (HTML + CSS + JS)
├── uploads/                   # Ảnh được lưu ở đây (volume mount)
│   └── .gitkeep
├── letsencrypt/               # SSL certificates (tự động tạo)
├── Dockerfile                 # Build app image
├── docker-compose.yml         # Orchestration
├── .env.example               # Template config
├── .env                       # Config thực tế (không commit)
├── .gitignore
└── README.md                  # File này
```

## 🛠️ Quản Lý & Maintenance

### Xem Logs

```bash
# All services
docker compose logs -f

# Chỉ app
docker compose logs -f app

# Chỉ traefik
docker compose logs -f traefik
```

### Restart Services

```bash
# Restart tất cả
docker compose restart

# Restart chỉ app
docker compose restart app
```

### Stop & Start

```bash
# Stop (containers vẫn còn)
docker compose stop

# Start lại
docker compose start

# Stop và xóa containers (ảnh vẫn còn)
docker compose down

# Start lại từ đầu
docker compose up -d
```

### Xóa Toàn Bộ (Bao Gồm Ảnh)

```bash
# Stop và xóa containers
docker compose down

# Xóa ảnh (CẨN THẬN!)
rm -rf uploads/*

# Xóa SSL certificates
rm -rf letsencrypt/*
```

### Backup Ảnh

```bash
# Backup
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/

# Restore
tar -xzf uploads-backup-YYYYMMDD.tar.gz
```

## 🧪 Test Locally (Không Có Domain)

Nếu bạn muốn test trên máy local mà chưa có domain:

### Option 1: Chỉ chạy App (Không có Traefik)

**Tạo file `docker-compose.local.yml`**:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DOMAIN=localhost:3000
    volumes:
      - ./uploads:/app/uploads
```

**Chạy**:
```bash
docker compose -f docker-compose.local.yml up -d
```

**Truy cập**: `http://localhost:3000`

### Option 2: Dùng Traefik với Localhost

Chỉnh file `.env`:
```env
DOMAIN=localhost
EMAIL=test@example.com
```

Chỉnh `docker-compose.yml` (comment dòng Let's Encrypt):
```yaml
# Comment out ACME settings
# - --certificatesresolvers.letsencrypt.acme.email=${EMAIL}
# - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
# - --certificatesresolvers.letsencrypt.acme.httpchallenge=true
```

Và bỏ TLS:
```yaml
labels:
  - traefik.enable=true
  - traefik.http.routers.app.rule=Host(`localhost`)
  - traefik.http.routers.app.entrypoints=web
  # Bỏ 2 dòng TLS
```

**Chạy**: `docker compose up -d`

**Truy cập**: `http://localhost`

## 🔧 Troubleshooting

### 1. "Bad Gateway" hoặc "Service Unavailable"

**Nguyên nhân**: App chưa start hoặc Traefik chưa detect được.

**Giải pháp**:
```bash
# Xem logs
docker compose logs -f

# Restart
docker compose restart app
```

### 2. SSL Certificate không tạo được

**Nguyên nhân**: 
- DNS chưa trỏ đúng
- Port 80/443 bị firewall block
- Email không hợp lệ

**Giải pháp**:
```bash
# Kiểm tra DNS
nslookup yourdomain.com

# Kiểm tra port
sudo netstat -tlnp | grep -E ':(80|443)'

# Xem logs Traefik
docker compose logs traefik | grep -i acme
```

### 3. Upload ảnh bị lỗi

**Nguyên nhân**: 
- File quá lớn (>10MB)
- File không phải ảnh
- Quyền ghi vào folder uploads

**Giải pháp**:
```bash
# Kiểm tra quyền
ls -la uploads/

# Fix quyền (nếu cần)
chmod 755 uploads/
```

### 4. Ảnh bị mất sau khi restart

**Nguyên nhân**: Volume mount không đúng.

**Giải pháp**: 
Kiểm tra trong `docker-compose.yml`:
```yaml
volumes:
  - ./uploads:/app/uploads  # Phải đúng path
```

### 5. Domain mới không hoạt động

**Nguyên nhân**: Đã đổi domain nhưng chưa cập nhật.

**Giải pháp**:
```bash
# Update .env với domain mới
nano .env

# Xóa SSL cũ
rm -rf letsencrypt/*

# Restart
docker compose down
docker compose up -d
```

## 🎨 Tùy Chỉnh

### Thay Đổi Port App

Mặc định app nghe port 3000. Để đổi:

**File `server.js`**:
```javascript
const PORT = process.env.PORT || 3000;
```

**File `docker-compose.yml`**:
```yaml
environment:
  - PORT=8080  # Port mới
labels:
  - traefik.http.services.app.loadbalancer.server.port=8080
```

### Thay Đổi Max Upload Size

**File `server.js`**:
```javascript
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});
```

### Tắt Traefik Dashboard

**File `docker-compose.yml`**:
```yaml
# Comment out
# - --api.dashboard=true
# - --api.insecure=true

# Và port
ports:
  - "80:80"
  - "443:443"
  # Bỏ "8080:8080"
```

## 📊 Tech Stack

- **Backend**: Node.js 18 + Express
- **Upload Handler**: Multer
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **Reverse Proxy**: Traefik v2.10
- **SSL**: Let's Encrypt (Auto)
- **Container**: Docker + Docker Compose

## 📝 License

MIT License - Free to use

## 🤝 Support

Nếu gặp vấn đề, tạo issue hoặc liên hệ.

---

**Tạo bởi**: Simple Image Upload  
**Version**: 1.0.0  
**Cập nhật**: 2026-01-08
