#!/usr/bin/env bash
set -euo pipefail

# Keep disk usage under control for local development:
# - Keeps only selected Ollama models
# - Prunes unused Docker resources
#
# Default behavior is DRY-RUN (no destructive action).
# Use --apply to execute changes.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APPLY=false
QUIET=false

# Default models to keep for KnowHub local dev tests.
KEEP_MODELS=(
  "nomic-embed-text:latest"
  "qwen2.5:3b"
)

print_help() {
  cat <<'EOF'
Usage:
  bash scripts/storage-maintenance.sh [options]

Options:
  --apply                 Execute cleanup actions (default is dry-run)
  --keep "m1,m2,..."      Comma-separated model list to keep
  --quiet                 Reduce output
  -h, --help              Show this help

Examples:
  bash scripts/storage-maintenance.sh
  bash scripts/storage-maintenance.sh --apply
  bash scripts/storage-maintenance.sh --apply --keep "nomic-embed-text:latest,qwen2.5:3b"
EOF
}

log() {
  if [[ "${QUIET}" == "false" ]]; then
    printf '%s\n' "$*"
  fi
}

contains() {
  local needle="$1"
  shift
  for item in "$@"; do
    if [[ "$item" == "$needle" ]]; then
      return 0
    fi
  done
  return 1
}

run_or_echo() {
  if [[ "${APPLY}" == "true" ]]; then
    "$@"
  else
    printf '[dry-run] '
    printf '%q ' "$@"
    printf '\n'
  fi
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --apply)
        APPLY=true
        shift
        ;;
      --keep)
        if [[ $# -lt 2 ]]; then
          echo "error: --keep requires a value" >&2
          exit 1
        fi
        IFS=',' read -r -a KEEP_MODELS <<<"$2"
        shift 2
        ;;
      --quiet)
        QUIET=true
        shift
        ;;
      -h|--help)
        print_help
        exit 0
        ;;
      *)
        echo "error: unknown argument '$1'" >&2
        print_help
        exit 1
        ;;
    esac
  done
}

cleanup_models() {
  log ""
  log "== Ollama models =="

  if ! docker compose -f "${ROOT_DIR}/docker-compose.yml" ps ollama >/dev/null 2>&1; then
    log "Ollama container not running. Skipping model cleanup."
    return 0
  fi

  local model_lines
  if ! model_lines="$(docker compose -f "${ROOT_DIR}/docker-compose.yml" exec -T ollama ollama list 2>/dev/null | tail -n +2)"; then
    log "Could not list Ollama models. Skipping model cleanup."
    return 0
  fi

  if [[ -z "${model_lines}" ]]; then
    log "No Ollama models found."
    return 0
  fi

  local remove_list=()
  while IFS= read -r line; do
    [[ -z "${line}" ]] && continue
    local model_name
    model_name="$(awk '{print $1}' <<<"${line}")"
    if ! contains "${model_name}" "${KEEP_MODELS[@]}"; then
      remove_list+=("${model_name}")
    fi
  done <<<"${model_lines}"

  log "Keeping models:"
  for m in "${KEEP_MODELS[@]}"; do
    log "  - ${m}"
  done

  if [[ ${#remove_list[@]} -eq 0 ]]; then
    log "No extra models to remove."
    return 0
  fi

  log "Models scheduled for removal:"
  for m in "${remove_list[@]}"; do
    log "  - ${m}"
    run_or_echo docker compose -f "${ROOT_DIR}/docker-compose.yml" exec -T ollama ollama rm "${m}"
  done
}

cleanup_docker() {
  log ""
  log "== Docker prune =="
  run_or_echo docker container prune -f
  run_or_echo docker image prune -a -f
  run_or_echo docker volume prune -f
  run_or_echo docker builder prune -f
}

main() {
  parse_args "$@"

  log "Disk maintenance mode: $([[ "${APPLY}" == "true" ]] && echo 'APPLY' || echo 'DRY-RUN')"
  log ""
  log "Before:"
  docker system df || true

  cleanup_models
  cleanup_docker

  log ""
  log "After:"
  docker system df || true
}

main "$@"
