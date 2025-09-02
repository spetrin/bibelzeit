# 🚀 Инструкция по развертыванию на Netlify

## Подготовка проекта

### 1. Структура проекта
```
timeline-frontend/
├── src/                 # Исходный код React
├── public/             # Статические файлы
├── dist/               # Собранный проект (создается при сборке)
├── netlify.toml        # Конфигурация Netlify
├── .env.example        # Пример переменных окружения
├── package.json        # Зависимости и скрипты
└── README.md          # Документация
```

### 2. Переменные окружения

Создайте файл `.env` на основе `.env.example`:

```bash
# API Configuration
VITE_API_BASE_URL=https://your-backend-api.com

# Development
VITE_DEV_MODE=false
```

## Развертывание на Netlify

### Способ 1: Через Git (рекомендуется)

1. **Подготовьте Git репозиторий:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/timeline-frontend.git
   git push -u origin main
   ```

2. **Подключите к Netlify:**
   - Войдите в [Netlify](https://app.netlify.com)
   - Нажмите "New site from Git"
   - Выберите GitHub/GitLab/Bitbucket
   - Выберите ваш репозиторий

3. **Настройки сборки:**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

4. **Переменные окружения:**
   - Site settings → Environment variables
   - Добавьте: `VITE_API_BASE_URL` = URL вашего бэкенда

### Способ 2: Ручная загрузка

1. **Соберите проект локально:**
   ```bash
   npm install
   npm run build
   ```

2. **Загрузите папку `dist`:**
   - Перейдите в [Netlify](https://app.netlify.com)
   - Перетащите папку `dist` в область "Deploy manually"

## Настройка бэкенда

### Рекомендуемые платформы для Flask API:

1. **Railway** (рекомендуется)
   - Простое развертывание
   - Автоматический HTTPS
   - Интеграция с Git

2. **Render**
   - Бесплатный план
   - Автоматические развертывания
   - Встроенная база данных

3. **Heroku**
   - Проверенная платформа
   - Множество аддонов
   - Простая интеграция

### Пример развертывания на Railway:

1. Подключите бэкенд репозиторий к Railway
2. Добавьте переменные окружения
3. Получите URL развертывания
4. Обновите `VITE_API_BASE_URL` в Netlify

## Конфигурация домена

### Пользовательский домен:

1. **В Netlify:**
   - Site settings → Domain management
   - Add custom domain
   - Следуйте инструкциям DNS

2. **SSL сертификат:**
   - Автоматически выдается Netlify
   - Принудительный HTTPS включен по умолчанию

## Мониторинг и отладка

### Логи сборки:
- Deploys → View build logs
- Проверьте ошибки сборки

### Функции отладки:
- Site settings → Functions
- Проверьте статус функций

### Аналитика:
- Site settings → Analytics
- Включите Netlify Analytics

## Оптимизация производительности

### 1. Кэширование:
```toml
# В netlify.toml уже настроено
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 2. Сжатие:
- Автоматически включено в Netlify
- Gzip и Brotli сжатие

### 3. CDN:
- Глобальная сеть Netlify CDN
- Автоматическое распределение контента

## Безопасность

### Headers безопасности:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### CORS настройки:
- Настройте в бэкенде Flask
- Разрешите домен Netlify

## Troubleshooting

### Частые проблемы:

1. **404 ошибки на маршрутах:**
   - Проверьте `netlify.toml` redirect правила
   - Убедитесь в SPA конфигурации

2. **API недоступен:**
   - Проверьте `VITE_API_BASE_URL`
   - Убедитесь в CORS настройках бэкенда

3. **Ошибки сборки:**
   - Проверьте версию Node.js
   - Убедитесь в совместимости зависимостей

### Полезные команды:

```bash
# Локальная сборка
npm run build

# Предварительный просмотр
npm run preview

# Проверка линтера
npm run lint

# Очистка кэша
rm -rf node_modules package-lock.json
npm install
```

## Контакты

При возникновении проблем:
1. Проверьте логи в Netlify Dashboard
2. Обратитесь к документации Netlify
3. Создайте issue в репозитории проекта

