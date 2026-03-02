SHELL := /bin/sh

.PHONY: env-setup dev down health ollama-pull

env-setup:
	npm run env:setup

dev: env-setup
	docker compose up -d
	npm run dev

down:
	docker compose down

health:
	docker compose ps
	curl --fail --silent http://localhost:3001/health > /dev/null && echo "API: healthy" || echo "API: unhealthy"
	curl --fail --silent http://localhost:11434/api/tags > /dev/null && echo "Ollama: healthy" || echo "Ollama: unhealthy"

ollama-pull:
	docker compose exec ollama ollama pull qwen2.5:3b
