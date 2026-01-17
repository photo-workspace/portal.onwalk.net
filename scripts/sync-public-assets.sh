#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "${SCRIPT_DIR}/.." && pwd)
PUBLIC_DIR="${REPO_ROOT}/public"

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--dry-run] [--apply] [--delete-extra] [--prefix <prefix>] [--cache-control <value>]

Description:
  Sync public/ assets to S3-compatible object storage using rclone.
  Defaults to dry-run for safety. Use --apply to execute changes.

Required environment variables:
  ACCESS_KEY_ID
  SECRET_ACCESS_KEY

Optional environment variables:
  STORAGE_PROVIDER       s3|r2|oss (default: r2)
  STORAGE_ENDPOINT       Required for r2/oss, optional for s3
  STORAGE_REGION         Optional; defaults to auto for r2
  STORAGE_BUCKET         Override bucket from runtime config
  STORAGE_PREFIX         Override prefix from runtime config
  STORAGE_CACHE_CONTROL  Default Cache-Control metadata

Examples:
  # Upload local public/ into bucket/public
  $(basename "$0") --dry-run --prefix public
  # Upload local public/ into bucket root
  $(basename "$0") --apply --delete-extra --cache-control "public, max-age=31536000"
USAGE
}

DRY_RUN=1
DELETE_EXTRA=0
PREFIX=""
CACHE_CONTROL=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=1
      ;;
    --apply)
      DRY_RUN=0
      ;;
    --delete-extra)
      DELETE_EXTRA=1
      ;;
    --prefix)
      PREFIX="${2:-}"
      shift
      ;;
    --cache-control)
      CACHE_CONTROL="${2:-}"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
  shift
done

if [[ -f "${REPO_ROOT}/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${REPO_ROOT}/.env"
  set +a
fi

if [[ ! -d "${PUBLIC_DIR}" ]]; then
  echo "public/ directory not found: ${PUBLIC_DIR}. Nothing to sync." >&2
  exit 0
fi

if ! command -v rclone >/dev/null 2>&1; then
  echo "rclone is required but not found in PATH" >&2
  exit 1
fi

ACCESS_KEY_ID="${ACCESS_KEY_ID:-}"
SECRET_ACCESS_KEY="${SECRET_ACCESS_KEY:-}"
STORAGE_BUCKET="${STORAGE_BUCKET:-}"
STORAGE_PROVIDER="${STORAGE_PROVIDER:-}"
STORAGE_ENDPOINT="${STORAGE_ENDPOINT:-}"
STORAGE_REGION="${STORAGE_REGION:-}"
STORAGE_PREFIX="${STORAGE_PREFIX:-}"
STORAGE_CACHE_CONTROL="${STORAGE_CACHE_CONTROL:-}"

if [[ -z "${ACCESS_KEY_ID}" || -z "${SECRET_ACCESS_KEY}" ]]; then
  echo "ACCESS_KEY_ID and SECRET_ACCESS_KEY are required" >&2
  exit 1
fi

yaml_get() {
  local file="$1"
  local target="$2"
  awk -v target="${target}" '
    function trim(s) { sub(/^[[:space:]]+/, "", s); sub(/[[:space:]]+$/, "", s); return s }
    function strip_comments(s) { sub(/[[:space:]]*#.*$/, "", s); return s }
    {
      line = strip_comments($0)
      if (line ~ /^[[:space:]]*$/) next
      first = match(line, /[^ \t]/)
      indent = first > 0 ? first - 1 : 0
      level = int(indent / 2)
      sub(/^[[:space:]]+/, "", line)
      split(line, parts, ":")
      key = trim(parts[1])
      value = ""
      if (length(parts) > 1) {
        value = substr(line, index(line, ":") + 1)
        value = trim(value)
      }
      if (key == "") next
      path[level] = key
      for (i = level + 1; i < 16; i++) { delete path[i] }
      full = path[0]
      for (i = 1; i <= level; i++) { if (path[i] != "") full = full "." path[i] }
      if (value != "" && full == target) {
        gsub(/^"|"$|^'\''|'\''$/, "", value)
        print value
        exit 0
      }
    }
  ' "${file}" 2>/dev/null
}

detect_runtime_env() {
  local runtime_config="${REPO_ROOT}/.runtime-env-config.yaml"
  local env_key=""
  if [[ -f "${runtime_config}" ]]; then
    env_key="$(yaml_get "${runtime_config}" "environment")"
  fi
  if [[ "${env_key}" != "prod" && "${env_key}" != "sit" ]]; then
    if [[ "${RUNTIME_ENV:-}" == "sit" ]]; then
      env_key="sit"
    else
      env_key="prod"
    fi
  fi
  echo "${env_key}"
}

resolve_runtime_config_value() {
  local key="$1"
  local env_key="$2"
  local base_file="${REPO_ROOT}/src/config/runtime-service-config.base.yaml"
  local env_file="${REPO_ROOT}/src/config/runtime-service-config.${env_key}.yaml"
  local value=""
  if [[ -f "${env_file}" ]]; then
    value="$(yaml_get "${env_file}" "${key}")"
  fi
  if [[ -z "${value}" && -f "${base_file}" ]]; then
    value="$(yaml_get "${base_file}" "${key}")"
  fi
  echo "${value}"
}

RUNTIME_ENV_KEY="$(detect_runtime_env)"
CONFIG_PROVIDER="$(resolve_runtime_config_value "storage.provider" "${RUNTIME_ENV_KEY}")"
CONFIG_BUCKET=""
CONFIG_ENDPOINT=""
CONFIG_PREFIX="$(resolve_runtime_config_value "storage.prefix" "${RUNTIME_ENV_KEY}")"

if [[ -n "${CONFIG_PROVIDER}" ]]; then
  CONFIG_BUCKET="$(resolve_runtime_config_value "storage.${CONFIG_PROVIDER}.bucket" "${RUNTIME_ENV_KEY}")"
  CONFIG_ENDPOINT="$(resolve_runtime_config_value "storage.${CONFIG_PROVIDER}.endpoint" "${RUNTIME_ENV_KEY}")"
fi

if [[ -z "${CONFIG_BUCKET}" ]]; then
  CONFIG_BUCKET="$(resolve_runtime_config_value "storage.bucket" "${RUNTIME_ENV_KEY}")"
fi

if [[ -z "${CONFIG_ENDPOINT}" ]]; then
  CONFIG_ENDPOINT="$(resolve_runtime_config_value "storage.endpoint" "${RUNTIME_ENV_KEY}")"
fi

if [[ -z "${STORAGE_PROVIDER}" ]]; then
  STORAGE_PROVIDER="${CONFIG_PROVIDER}"
fi
if [[ -z "${STORAGE_PROVIDER}" ]]; then
  STORAGE_PROVIDER="r2"
fi

if [[ -z "${STORAGE_BUCKET}" ]]; then
  STORAGE_BUCKET="${CONFIG_BUCKET}"
fi

if [[ -z "${STORAGE_ENDPOINT}" ]]; then
  STORAGE_ENDPOINT="${CONFIG_ENDPOINT}"
fi

if [[ -z "${STORAGE_PREFIX}" ]]; then
  STORAGE_PREFIX="${CONFIG_PREFIX}"
fi

if [[ -z "${CACHE_CONTROL}" && -n "${STORAGE_CACHE_CONTROL}" ]]; then
  CACHE_CONTROL="${STORAGE_CACHE_CONTROL}"
fi

if [[ -z "${STORAGE_BUCKET}" ]]; then
  echo "Missing bucket; nothing to sync. Set STORAGE_BUCKET or runtime-service-config*.yaml." >&2
  exit 0
fi

PROVIDER_NAME=""
case "${STORAGE_PROVIDER}" in
  r2)
    PROVIDER_NAME="Cloudflare"
    if [[ -z "${STORAGE_ENDPOINT}" ]]; then
      echo "Missing endpoint for r2; nothing to sync. Set STORAGE_ENDPOINT or runtime-service-config*.yaml." >&2
      exit 0
    fi
    if [[ -z "${STORAGE_REGION}" ]]; then
      STORAGE_REGION="auto"
    fi
    ;;
  oss)
    PROVIDER_NAME="Alibaba"
    if [[ -z "${STORAGE_ENDPOINT}" ]]; then
      echo "Missing endpoint for oss; nothing to sync. Set STORAGE_ENDPOINT or runtime-service-config*.yaml." >&2
      exit 0
    fi
    ;;
  s3)
    PROVIDER_NAME="AWS"
    ;;
  *)
    echo "Unsupported STORAGE_PROVIDER: ${STORAGE_PROVIDER} (expected s3|r2|oss)" >&2
    exit 1
    ;;
esac

REMOTE_NAME="assets"
REMOTE_ENV_PREFIX="RCLONE_CONFIG_${REMOTE_NAME^^}"

RCLONE_ENV=(
  "${REMOTE_ENV_PREFIX}_TYPE=s3"
  "${REMOTE_ENV_PREFIX}_PROVIDER=${PROVIDER_NAME}"
  "${REMOTE_ENV_PREFIX}_ACCESS_KEY_ID=${ACCESS_KEY_ID}"
  "${REMOTE_ENV_PREFIX}_SECRET_ACCESS_KEY=${SECRET_ACCESS_KEY}"
  "${REMOTE_ENV_PREFIX}_FORCE_PATH_STYLE=true"
)

if [[ -n "${STORAGE_ENDPOINT}" ]]; then
  RCLONE_ENV+=("${REMOTE_ENV_PREFIX}_ENDPOINT=${STORAGE_ENDPOINT}")
fi

if [[ -n "${STORAGE_REGION}" ]]; then
  RCLONE_ENV+=("${REMOTE_ENV_PREFIX}_REGION=${STORAGE_REGION}")
fi

if [[ -z "${PREFIX}" ]]; then
  PREFIX="/"
fi

if [[ "${PREFIX}" == "/" ]]; then
  PREFIX=""
else
  PREFIX="${PREFIX#/}"
  PREFIX="${PREFIX%/}"
fi

DESTINATION="${REMOTE_NAME}:${STORAGE_BUCKET}"
if [[ -n "${PREFIX}" ]]; then
  DESTINATION="${DESTINATION}/${PREFIX}"
fi

COMMAND="copy"
if [[ "${DELETE_EXTRA}" -eq 1 ]]; then
  COMMAND="sync"
fi

RCLONE_ARGS=(
  "${COMMAND}"
  "--exclude" ".DS_Store"
  "--exclude" "**/.DS_Store"
)

if [[ "${DRY_RUN}" -eq 1 ]]; then
  RCLONE_ARGS+=("--dry-run")
fi

if [[ -n "${CACHE_CONTROL}" ]]; then
  RCLONE_ARGS+=("--s3-cache-control" "${CACHE_CONTROL}")
fi

env "${RCLONE_ENV[@]}" rclone "${RCLONE_ARGS[@]}" "${PUBLIC_DIR}/" "${DESTINATION}"
