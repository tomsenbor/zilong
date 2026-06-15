#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f package.json || ! -f compose.yaml ]]; then
  echo "请在项目根目录中运行 deploy/server-install.sh"
  exit 1
fi

echo "[1/5] 安装 Docker..."
sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose-v2 openssl curl
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"

echo "[2/5] 创建生产配置..."
read -r -p "后台用户名 [admin]: " ADMIN_USERNAME
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
while true; do
  read -r -s -p "请设置后台密码（至少 12 位）: " ADMIN_PASSWORD
  echo
  if [[ ${#ADMIN_PASSWORD} -ge 12 ]]; then
    break
  fi
  echo "密码长度不足 12 位，请重新输入。"
done

SESSION_SECRET="$(openssl rand -hex 32)"
cat > .env.production <<EOF
SESSION_SECRET=${SESSION_SECRET}
ADMIN_USERNAME=${ADMIN_USERNAME}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
APP_PORT=3000
MAX_UPLOAD_MB=5
TRUST_PROXY=false
COOKIE_SECURE=false
EOF
chmod 600 .env.production
unset ADMIN_PASSWORD SESSION_SECRET

echo "[3/5] 获取 Node 基础镜像..."
BASE_IMAGE=""
for IMAGE in \
  "node:24-alpine" \
  "public.ecr.aws/docker/library/node:24-alpine" \
  "m.daocloud.io/docker.io/library/node:24-alpine" \
  "docker.1ms.run/library/node:24-alpine"
do
  echo "尝试 ${IMAGE}"
  if sudo docker pull "$IMAGE"; then
    BASE_IMAGE="$IMAGE"
    break
  fi
done

if [[ -z "$BASE_IMAGE" ]]; then
  echo "所有镜像源均不可用，请检查服务器网络后重试。"
  exit 1
fi
echo "BASE_IMAGE=${BASE_IMAGE}" >> .env.production

echo "[4/5] 构建并启动容器..."
sudo docker compose --env-file .env.production up -d --build

echo "[5/5] 等待健康检查..."
for _ in {1..30}; do
  if curl -fsS http://127.0.0.1:3000/api/health | grep -q '"status":"ok"'; then
    PUBLIC_IP="$(curl -4fsS --max-time 5 https://api.ipify.org || true)"
    echo
    echo "部署成功。"
    echo "前台：http://${PUBLIC_IP:-服务器公网IP}:3000"
    echo "后台：http://${PUBLIC_IP:-服务器公网IP}:3000/admin"
    echo "下一步将通过 Caddy 映射到 80/443 端口并配置域名。"
    exit 0
  fi
  sleep 2
done

echo "容器已启动，但健康检查未通过："
sudo docker compose --env-file .env.production ps
sudo docker compose --env-file .env.production logs --tail 80
exit 1
