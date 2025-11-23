# Docker Setup для Онлайн Магазину

Цей проект налаштований для запуску в Docker контейнерах з MariaDB.

## Розробка (Development)

### Швидкий старт для розробки

1. **Створіть `.env` файл** (скопіюйте з `.env.example`):
```bash
cp .env.example .env
```

2. **Побудуйте та запустіть контейнери**:
```bash
make dev-build
make dev-up
```

Або без Makefile:
```bash
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up -d
```

3. **Переглянути логи**:
```bash
make dev-logs
```

4. Відкрийте браузер: http://localhost:3000

### Особливості Development режиму

- ✅ Hot reload - зміни в коді відображаються автоматично
- ✅ Вихідний код монтується як volume
- ✅ Prisma міграції запускаються автоматично при старті
- ✅ Розробницький сервер з повною підтримкою HMR

## Продакшн (Production)

Для продакшн використання:

```bash
make build
make up
```

## Docker Compose Services

### Development (`docker-compose.dev.yml`)

#### app (Development)
- Nuxt 4 додаток в dev режимі
- Порт: 3000
- Hot Module Replacement (HMR)
- Автоматичні міграції при старті
- Код монтується як volume

#### mariadb
- MariaDB 11.3
- Порт: 3306
- Дані зберігаються в Docker volume `mariadb_dev_data`

### Production (`docker-compose.yml`)

#### app (Production)
- Зібраний Nuxt 4 додаток
- Оптимізований production build
- Автоматичні міграції при старті

## Команди Makefile

### Development команди

- `make dev-build` - Побудувати Docker образи (development)
- `make dev-up` / `make dev` - Запустити всі сервіси (development)
- `make dev-down` - Зупинити всі сервіси (development)
- `make dev-restart` - Перезапустити сервіси (development)
- `make dev-logs` - Переглянути логи всіх сервісів (development)
- `make dev-logs-app` - Логи тільки додатку (development)
- `make dev-logs-db` - Логи тільки бази даних (development)
- `make dev-clean` - Зупинити та видалити volumes (development)
- `make migrate-dev` - Створити нову міграцію (development)
- `make seed-dev` - Заповнити БД тестовими даними (development)
- `make prisma-studio-dev` - Відкрити Prisma Studio (development)
- `make shell-app-dev` - Відкрити shell в контейнері додатку (development)
- `make shell-db-dev` - Відкрити MySQL shell (development)

### Production команди

- `make build` - Побудувати Docker образи (production)
- `make up` - Запустити всі сервіси (production)
- `make down` - Зупинити всі сервіси (production)
- `make restart` - Перезапустити сервіси (production)
- `make logs` - Переглянути логи всіх сервісів (production)
- `make clean` - Зупинити та видалити volumes (production)

### Загальні команди

- `make migrate` - Запустити міграції
- `make seed` - Заповнити БД тестовими даними
- `make prisma-studio` - Відкрити Prisma Studio
- `make shell-app` - Відкрити shell в контейнері додатку
- `make shell-db` - Відкрити MySQL shell

## Налаштування змінних середовища

Створіть `.env` файл з наступними змінними:

```env
# Database Configuration
DATABASE_URL="mysql://shop_user:shoppassword@mariadb:3306/shop_lab?connection_limit=5"
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=shop_lab
MYSQL_USER=shop_user
MYSQL_PASSWORD=shoppassword
MARIADB_PORT=3306

# Application Configuration
APP_PORT=3000
SESSION_SECRET=dev-secret-key-change-in-production
```

## Робочий процес розробки

1. **Запустіть development середовище**:
```bash
make dev
```

2. **Відкрийте проект в IDE** та почніть редагувати код

3. **Переглядайте логи**:
```bash
make dev-logs-app
```

4. **Створіть нову міграцію при зміні схеми**:
```bash
make migrate-dev
```

5. **Відкрийте Prisma Studio для перегляду даних**:
```bash
make prisma-studio-dev
```

6. **Зупиніть середовище**:
```bash
make dev-down
```

## Troubleshooting

### База даних не запускається
```bash
make dev-logs-db
```

### Додаток не підключається до БД
Перевірте, чи база даних готова:
```bash
docker-compose -f docker-compose.dev.yml ps
```

База даних повинна мати статус "healthy".

### Зміни в коді не відображаються
- Перевірте логи: `make dev-logs-app`
- Перезапустіть контейнер: `make dev-restart`
- Переконайтеся, що volumes правильно монтовані

### Видалити всі дані і почати заново
```bash
make dev-clean
make dev-build
make dev-up
```

### Переглянути структуру бази даних
```bash
make shell-db-dev
# Потім в MySQL:
SHOW TABLES;
DESCRIBE User;
```

## Структура Docker файлів

```
Dockerfile           # Production build для Nuxt додатку
Dockerfile.dev       # Development build для Nuxt додатку
docker-compose.yml   # Production compose файл
docker-compose.dev.yml # Development compose файл
docker/entrypoint.sh # Скрипт для міграцій при старті
.dockerignore        # Файли ігноруються при build
```

## Продакшн рекомендації

Для продакшн використання:

1. Змініть `SESSION_SECRET` на безпечний випадковий ключ
2. Змініть паролі в `.env`
3. Використовуйте зовнішню базу даних або налаштуйте бекуп
4. Налаштуйте обернений проксі (nginx, traefik) для HTTPS
5. Обмежте ресурси контейнерів в `docker-compose.yml`
6. Використовуйте `.env.production` для production змінних