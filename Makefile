.PHONY: help build up down restart logs clean migrate seed dev dev-up dev-down dev-logs dev-build

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Production targets
build: ## Build Docker images (production)
	docker-compose build

up: ## Start all services (production)
	docker-compose up -d

down: ## Stop all services (production)
	docker-compose down

restart: ## Restart all services (production)
	docker-compose restart

logs: ## Show logs from all services (production)
	docker-compose logs -f

logs-app: ## Show logs from app service (production)
	docker-compose logs -f app

logs-db: ## Show logs from database service (production)
	docker-compose logs -f mariadb

clean: ## Stop services and remove volumes (production)
	docker-compose down -v

# Development targets
dev-build: ## Build Docker images (development)
	docker-compose -f docker-compose.dev.yml build

dev-up: ## Start all services (development with hot reload)
	docker-compose -f docker-compose.dev.yml up -d

dev: dev-up ## Alias for dev-up
	@echo "Development environment started!"
	@echo "App: http://localhost:3000"
	@echo "Watch logs: make dev-logs"

dev-down: ## Stop all services (development)
	docker-compose -f docker-compose.dev.yml down

dev-logs: ## Show logs from all services (development)
	docker-compose -f docker-compose.dev.yml logs -f

dev-logs-app: ## Show logs from app service (development)
	docker-compose -f docker-compose.dev.yml logs -f app

dev-logs-db: ## Show logs from database service (development)
	docker-compose -f docker-compose.dev.yml logs -f mariadb

dev-restart: ## Restart all services (development)
	docker-compose -f docker-compose.dev.yml restart

dev-clean: ## Stop services and remove volumes (development)
	docker-compose -f docker-compose.dev.yml down -v

# Common targets
migrate: ## Run database migrations
	docker-compose exec app bunx prisma migrate deploy || docker-compose exec app npx prisma migrate deploy

migrate-dev: ## Create new migration (development)
	docker-compose -f docker-compose.dev.yml exec app bunx prisma migrate dev || docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev

seed: ## Seed database with initial data
	docker-compose exec app curl -X POST http://localhost:3000/api/seed || echo "Seed endpoint called"

seed-dev: ## Seed database with initial data (development)
	docker-compose -f docker-compose.dev.yml exec app curl -X POST http://localhost:3000/api/seed || echo "Seed endpoint called"

prisma-studio: ## Open Prisma Studio
	docker-compose exec app bunx prisma studio --hostname 0.0.0.0 || docker-compose exec app npx prisma studio --hostname 0.0.0.0

prisma-studio-dev: ## Open Prisma Studio (development)
	docker-compose -f docker-compose.dev.yml exec app bunx prisma studio --hostname 0.0.0.0 || docker-compose -f docker-compose.dev.yml exec app npx prisma studio --hostname 0.0.0.0

shell-app: ## Open shell in app container (production)
	docker-compose exec app sh

shell-app-dev: ## Open shell in app container (development)
	docker-compose -f docker-compose.dev.yml exec app sh

shell-db: ## Open MySQL shell in database container
	docker-compose exec mariadb mysql -u shop_user -pshoppassword shop_lab

shell-db-dev: ## Open MySQL shell in database container (development)
	docker-compose -f docker-compose.dev.yml exec mariadb mysql -u shop_user -pshoppassword shop_lab
