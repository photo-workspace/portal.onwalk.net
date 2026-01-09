#!/usr/bin/env bash
set -euo pipefail

MEDIA_ROOT="/var/www/media"

echo "==> Initializing media directory structure at: ${MEDIA_ROOT}"

# 基础目录
mkdir -pv "${MEDIA_ROOT}"/{images,videos,audio,downloads,json}

# 图片分类
mkdir -pv "${MEDIA_ROOT}/images"/{contact,blog,cover,gallery}

# 视频分类
mkdir -pv "${MEDIA_ROOT}/videos"/{clips,long,reels}

# 下载内容
mkdir -pv "${MEDIA_ROOT}/downloads"/{app,assets}

# JSON / manifest
mkdir -pv "${MEDIA_ROOT}/json"/manifests

echo "==> Directory structure created successfully."

# 权限建议（如使用 caddy 用户）
if id caddy &>/dev/null; then
  echo "==> Setting ownership to caddy:caddy"
  chown -R caddy:caddy "${MEDIA_ROOT}"
fi

echo "==> Done."
