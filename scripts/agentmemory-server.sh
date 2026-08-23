#!/usr/bin/env bash
set -euo pipefail

# Derive data directory at runtime from git common metadata
git_common_dir="$(git rev-parse --git-common-dir 2>/dev/null || true)"
if [[ -z "$git_common_dir" ]]; then
  printf '%s\n' "agentmemory-server.sh must run inside a Git worktree" >&2
  exit 1
fi
if [[ "$git_common_dir" != /* ]]; then
  git_common_dir="$(git rev-parse --path-format=absolute --git-common-dir)"
fi
state_root="${git_common_dir}/agentmemory"
private_home="${state_root}/home"
mkdir -p "$private_home" "${state_root}/xdg-config" "${state_root}/xdg-data" "${state_root}/xdg-cache" "${state_root}/npm-cache"
chmod 700 "$state_root" "$private_home" "${state_root}/xdg-config" "${state_root}/xdg-data" "${state_root}/xdg-cache" "${state_root}/npm-cache"

# AgentMemory v0.9.22 stores its state under homedir()/.agentmemory. Give the
# pinned process a synthetic project-private home so it cannot read or write the
# operator's real ~/.agentmemory configuration or data.
export HOME="$private_home"
export XDG_CONFIG_HOME="${state_root}/xdg-config"
export XDG_DATA_HOME="${state_root}/xdg-data"
export XDG_CACHE_HOME="${state_root}/xdg-cache"
export npm_config_cache="${state_root}/npm-cache"

# Force local/no-cloud mode. Empty values override any provider keys in the
# package's optional ~/.agentmemory/.env file as well as inherited variables.
export OPENAI_API_KEY=""
export ANTHROPIC_API_KEY=""
export COHERE_API_KEY=""
export GOOGLE_API_KEY=""
export AZURE_OPENAI_API_KEY=""
export PINECONE_API_KEY=""
export QDRANT_API_KEY=""
export VOYAGE_API_KEY=""
export MISTRAL_API_KEY=""
export GEMINI_API_KEY=""
export MINIMAX_API_KEY=""
export OPENROUTER_API_KEY=""
export OPENAI_API_KEY_FOR_LLM="false"
export FALLBACK_PROVIDERS=""
export AWS_SECRET_ACCESS_KEY=""
export AWS_ACCESS_KEY_ID=""

# Set mandatory local mode variables
export EMBEDDING_PROVIDER="local"
export AGENTMEMORY_AUTO_COMPRESS="false"
export AGENTMEMORY_INJECT_CONTEXT="false"
export AGENTMEMORY_ALLOW_AGENT_SDK="false"
export GRAPH_EXTRACTION_ENABLED="false"
export CONSOLIDATION_ENABLED="false"
export CLAUDE_MEMORY_BRIDGE="false"
export SNAPSHOT_ENABLED="false"
export AGENTMEMORY_IMAGE_EMBEDDINGS="false"
export AGENTMEMORY_USE_DOCKER="0"

# Keep any cwd-relative iii-engine state inside the same private Git-metadata
# store. The pinned AgentMemory CLI has no --data-dir option.
cd "$state_root"
exec npx -y @agentmemory/agentmemory@0.9.22 "$@"
