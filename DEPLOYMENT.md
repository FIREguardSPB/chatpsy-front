# 📘 Инструкция по деплою изменений

## 🎯 Быстрый старт

### Деплой фронтенда (после правок в коде)
```powershell
# В PowerShell (Windows)
.\deploy-frontend.ps1
```

**Что делает скрипт:**
1. ✅ Собирает production билд (`npm run build`)
2. ✅ Коммитит изменения в Git
3. ✅ Пушит в GitHub
4. ✅ Подключается к VPS
5. ✅ Клонирует свежий код
6. ✅ Собирает и деплоит на сервер

**Время выполнения:** ~2-3 минуты

---

## 🔄 Ручной деплой (пошагово)

### Фронтенд

#### **Шаг 1: Локально**
```powershell
cd "d:\Дубликат СТАРТАПА\chat-psy-analyzer"

# Проверь что всё работает
npm run dev

# Собери production билд
npm run build

# Закоммить и запушить
git add .
git commit -m "Описание изменений"
git push
```

#### **Шаг 2: На сервере**
```bash
ssh -i "C:\RSA_KEYS\id_rsa" root@77.222.60.126

# Обновить код
cd /tmp
rm -rf frontend-build
git clone https://github.com/FIREguardSPB/chatpsy-front.git frontend-build
cd frontend-build

# Установить зависимости и собрать
npm install
npm run build

# Скопировать на продакшн
rm -rf /var/www/chatpsy/frontend/*
cp -r dist/* /var/www/chatpsy/frontend/

# Готово!
echo "✅ Frontend deployed!"
```

---

### Бэкенд

#### **Шаг 1: Локально**
```powershell
cd "d:\Дубликат СТАРТАПА\backend"

# Закоммить изменения
git add .
git commit -m "Описание изменений"
git push
```

#### **Шаг 2: На сервере**
```bash
ssh -i "C:\RSA_KEYS\id_rsa" root@77.222.60.126

# Обновить код
cd /var/www/chatpsy/backend
git pull

# Перезапустить сервис
systemctl restart chatpsy-backend

# Проверить статус
systemctl status chatpsy-backend
```

---

## 🤖 Автоматический деплой (CI/CD) через GitHub Actions

### Настройка (один раз)

1. **Добавь secrets в GitHub:**
   - Открой https://github.com/FIREguardSPB/chatpsy-front/settings/secrets/actions
   - Создай 3 секрета:
     - `VPS_HOST`: `77.222.60.126`
     - `VPS_USER`: `root`
     - `VPS_SSH_KEY`: содержимое файла `C:\RSA_KEYS\id_rsa` (весь текст)

2. **Запуши GitHub Action конфиг:**
```powershell
git add .github/workflows/deploy.yml
git commit -m "Add CI/CD workflow"
git push
```

### Использование

Теперь при каждом `git push` в ветку `main` автоматически:
- ✅ Соберётся билд
- ✅ Задеплоится на VPS
- ✅ Получишь уведомление в GitHub

**Как запустить вручную:**
- Открой https://github.com/FIREguardSPB/chatpsy-front/actions
- Выбери "Deploy Frontend to VPS"
- Нажми "Run workflow"

---

## 📋 Полезные команды

### Просмотр логов
```bash
# Логи бэкенда (последние 100 строк)
ssh -i "C:\RSA_KEYS\id_rsa" root@77.222.60.126 "journalctl -u chatpsy-backend -n 100 --no-pager"

# Логи в реальном времени (для отладки)
ssh -i "C:\RSA_KEYS\id_rsa" root@77.222.60.126 "journalctl -u chatpsy-backend -f"

# Логи Nginx
ssh -i "C:\RSA_KEYS\id_rsa" root@77.222.60.126 "tail -f /var/log/nginx/access.log"
```

### Управление сервисами
```bash
# Статус
ssh -i "C:\RSA_KEYS\id_rsa" root@77.222.60.126 "systemctl status chatpsy-backend"

# Перезапуск бэкенда
ssh -i "C:\RSA_KEYS\id_rsa" root@77.222.60.126 "systemctl restart chatpsy-backend"

# Перезапуск Nginx
ssh -i "C:\RSA_KEYS\id_rsa" root@77.222.60.126 "systemctl restart nginx"
```

### Редактирование .env
```bash
# Подключись к серверу
ssh -i "C:\RSA_KEYS\id_rsa" root@77.222.60.126

# Отредактируй .env
nano /var/www/chatpsy/backend/.env

# После изменений: Ctrl+O (сохранить), Enter, Ctrl+X (выйти)

# Перезапусти бэкенд
systemctl restart chatpsy-backend
```

---

## 🎨 Типичные сценарии

### 1. Исправил баг в UI
```powershell
# Тестируй локально
npm run dev

# Деплой одной командой
.\deploy-frontend.ps1
```

### 2. Изменил API endpoint в бэкенде
```bash
# Локально: закоммить
git add .
git commit -m "Fix API endpoint"
git push

# На сервере
ssh -i "C:\RSA_KEYS\id_rsa" root@77.222.60.126 "cd /var/www/chatpsy/backend && git pull && systemctl restart chatpsy-backend"
```

### 3. Изменил переменные окружения
```bash
# Подключись к серверу
ssh -i "C:\RSA_KEYS\id_rsa" root@77.222.60.126

# Отредактируй .env
nano /var/www/chatpsy/backend/.env

# Перезапусти
systemctl restart chatpsy-backend
```

### 4. Сайт упал / не отвечает
```bash
# Проверь статус
ssh -i "C:\RSA_KEYS\id_rsa" root@77.222.60.126 "systemctl status chatpsy-backend nginx"

# Посмотри логи
ssh -i "C:\RSA_KEYS\id_rsa" root@77.222.60.126 "journalctl -u chatpsy-backend -n 50"

# Перезапусти всё
ssh -i "C:\RSA_KEYS\id_rsa" root@77.222.60.126 "systemctl restart chatpsy-backend nginx"
```

---

## ⚡ Горячие клавиши для быстрой работы

Создай алиасы в PowerShell профиле (`$PROFILE`):

```powershell
# Открой профиль
notepad $PROFILE

# Добавь функции:
function Deploy-ChatPsy {
    & "d:\Дубликат СТАРТАПА\chat-psy-analyzer\deploy-frontend.ps1"
}

function ChatPsy-Logs {
    ssh -i "C:\RSA_KEYS\id_rsa" root@77.222.60.126 "journalctl -u chatpsy-backend -n 100 --no-pager"
}

function ChatPsy-SSH {
    ssh -i "C:\RSA_KEYS\id_rsa" root@77.222.60.126
}

# Сохрани и перезапусти PowerShell
```

Теперь можно:
- `Deploy-ChatPsy` - задеплоить
- `ChatPsy-Logs` - посмотреть логи
- `ChatPsy-SSH` - подключиться к серверу

---

## 🔐 Безопасность

- ✅ Никогда не коммить `.env` файлы с реальными ключами
- ✅ Использовать `.env.example` с плейсхолдерами
- ✅ SSH ключи хранить локально, не в репозитории
- ✅ Регулярно обновлять систему на VPS: `apt update && apt upgrade`

---

## 📞 Поддержка

**Проблемы с деплоем?**
1. Проверь логи: `ChatPsy-Logs`
2. Проверь статус: `ssh ... "systemctl status chatpsy-backend nginx"`
3. Перезапусти сервисы: `ssh ... "systemctl restart chatpsy-backend nginx"`

**Сайт:** https://chatpsy.online  
**GitHub Frontend:** https://github.com/FIREguardSPB/chatpsy-front  
**GitHub Backend:** https://github.com/FIREguardSPB/chatpsy-backend
