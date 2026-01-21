SHELL := /bin/bash
NODE_VERSION := $(shell node -v 2>/dev/null || echo "Not Found")
MAGICK := $(shell command -v magick 2>/dev/null || command -v convert 2>/dev/null)
OS := $(shell uname -s)
YARN_VERSION ?= 4.12.0

.PHONY: init ensure-deps dev build export clean info icon test

icon:
	@echo "🎨 Generating favicon and icon images..."
	@if [ -z "$(MAGICK)" ]; then \
		echo "❌ ImageMagick not found."; \
		if [ "$(OS)" = "Darwin" ]; then \
			echo "👉 Try: brew install imagemagick"; \
		elif [ -f /etc/debian_version ]; then \
			echo "👉 Try: sudo apt install imagemagick"; \
		elif [ -f /etc/redhat-release ]; then \
			echo "👉 Try: sudo dnf install imagemagick"; \
		fi; \
		exit 1; \
	fi
	@mkdir -p public/icons
	@$(MAGICK) public/icons/onwalk-net-logo.png -resize 32x32 public/icons/favicon-32x32.png
	@$(MAGICK) public/icons/onwalk-net-logo.png -resize 64x64 -background none -define icon:auto-resize=64,48,32,16 public/favicon.ico
	@echo "✅ Icons generated successfully."

init:
	@echo "🔧 Installing dependencies for dashboard..."
	@corepack enable && corepack prepare yarn@$(YARN_VERSION) --activate
	@echo "🧹 Removing npm lockfiles to mirror Docker build..."
	@find . -name "package-lock.json" -delete
	@yarn config set npmRegistryServer https://registry.npmmirror.com
	@yarn install --immutable

ensure-deps:
	@if [ ! -d node_modules ]; then \
		echo "📦 Installing dependencies..."; \
		$(MAKE) init; \
	fi

dev: ensure-deps
	@echo "Starting Next.js dev server (dashboard)..."
	@echo "/editor is proxied to an external NeuraPress front-end at http://localhost:4000."
	yarn dev -p 3001

test:
	@echo "🔍 Running tests..."
	@yarn test || echo "No tests configured"

build: init
	@yarn config set npmRegistryServer https://registry.npmmirror.com
	@echo "🔨 Building dashboard..."
	yarn prebuild
	NEXT_TELEMETRY_DISABLED=1 NEXT_PRIVATE_TURBOPACK=1 yarn next build

export:
	@echo "📦 Exporting dashboard static site to ./out ..."
	@NEXT_SHOULD_EXPORT=true yarn next export

sync-assets:
	python3 scripts/generate-media-index.py
	@echo "🔄 Syncing public assets to object storage..."
	@# Source .env and extract R2 config manually to pass to script
	@if [ -f .env ]; then set -a; source .env; set +a; fi; \
	BUCKET=$${STORAGE_BUCKET:-$${R2_BUCKET_NAME}}; \
	ENDPOINT=$${STORAGE_ENDPOINT:-$${R2_ENDPOINT}}; \
	STORAGE_BUCKET="$$BUCKET" STORAGE_ENDPOINT="$$ENDPOINT" bash scripts/sync-public-assets.sh --apply

clean:
	@echo "🧹 Cleaning .next and out directories..."
	rm -rf .next out

info:
	@echo "🧾 Node.js version: $(NODE_VERSION)"
