/**
 * Application text constants
 * All user-facing text for easy modification and future localization
 */

export const APP_TEXT = {
  // App Header
  APP_NAME: 'ChatPsy',
  APP_BETA: 'beta',
  APP_TAGLINE: 'Анализ переписки с помощью ИИ',

  // Hero Banner
  HERO_TAG: 'Бесплатно в тестовом режиме',
  HERO_TITLE: 'Понимай, что стоит за сообщениями',
  HERO_DESCRIPTION:
    'Загрузите чат из WhatsApp или Telegram и получите аккуратный психологический разбор: стиль общения, динамика отношений и рекомендации от ИИ. Конфиденциально и без регистрации.',

  // Footer
  FOOTER_TEXT: '© 2025 ChatPsy. Все данные обрабатываются конфиденциально.',

  // Chat Upload Form
  UPLOAD_TITLE: '1. Загрузка переписки',
  UPLOAD_DESCRIPTION:
    'Экспортируйте чат и загрузите сюда. Можно выбрать сразу несколько файлов одной переписки (например, messages.html, messages1.html, messages2.html и т.д.). Мы анонимизируем имена, телефоны и e-mail перед отправкой на сервер.',
  UPLOAD_BUTTON: 'Выбрать файлы',
  UPLOAD_NO_FILE: 'Файл не выбран',
  UPLOAD_FILES_SELECTED: 'Список выбранных файлов ниже',
  UPLOAD_FILES_COUNT: 'Выбрано файлов:',
  UPLOAD_TOTAL_SIZE: 'общий размер:',
  UPLOAD_ERROR: 'Не удалось прочитать файлы. Попробуйте ещё раз.',
  UPLOAD_PREVIEW_ORIGINAL: 'Оригинал (фрагмент, объединённые файлы)',
  UPLOAD_PREVIEW_ANONYMIZED: 'Анонимизированный текст (фрагмент)',
  UPLOAD_MAPPING_SHOW: 'Показать, кто стал кем (только локально)',

  // Analysis Section
  ANALYSIS_TITLE: '2. Анализ',
  ANALYSIS_DESCRIPTION:
    'После загрузки переписки нажмите кнопку ниже, чтобы получить психологический разбор и рекомендации.',
  ANALYSIS_BUTTON: 'Проанализировать переписку',
  ANALYSIS_BUTTON_LOADING: 'АНАЛИЗИРУЕМ...',
  ANALYSIS_HINT_UPLOAD_FIRST: 'Сначала загрузите файл с перепиской.',
  ANALYSIS_HINT_OVER_LIMIT:
    'Объём выбранного диапазона выше рекомендуемого. Уменьшите период выборки.',

  // Meta Block
  META_TITLE: 'Диапазон и объём данных',
  META_DESCRIPTION:
    'Выберите период переписки. Мы оценим, сколько текста попадёт в модель. Для тестового режима лучше держаться в рамках рекомендуемого объёма.',
  META_LOADING_TITLE: 'Диапазон и объём данных',
  META_LOADING_TEXT:
    'Считаем объём переписки и диапазон дат… Это может занять немного времени при больших файлах.',
  META_LOADING_LABEL: 'Анализируем структуру чата…',
  META_RANGE_FROM: 'С',
  META_RANGE_TO: 'По',
  META_RANGE_HINT: 'Диапазон в экспорте:',
  META_STAT_UPLOADED: 'Всего загружено',
  META_STAT_IN_MODEL: 'В модель при выбранном диапазоне (оценочно)',
  META_RECOMMENDED_LIMIT: 'Рекомендуемый объём для одного анализа:',
  META_LIMIT_WARNING:
    'Если оценка выше — лучше сузить период.',

  // Analysis Modal
  MODAL_ANALYZING_TITLE: 'Провожу анализ переписки…',
  MODAL_ANALYZING_TEXT:
    'Это может занять немного времени, особенно для больших чатов. Пожалуйста, не закрывайте страницу.',

  // Results
  RESULTS_TITLE: 'Результаты анализа',
  RESULTS_SUBTITLE:
    'Психологический портрет участников, динамика отношений и практические рекомендации на основе вашей переписки.',
  RESULTS_EXPORT_PDF: 'Сохранить как PDF',
  RESULTS_EXPORT_DOCX: 'Скачать .docx',
  RESULTS_NEW_ANALYSIS: 'Новый анализ',

  // Feedback
  FEEDBACK_TITLE: 'Оставить отзыв',
  FEEDBACK_DESCRIPTION:
    'Пара предложений о том, насколько полезен вам анализ, что понравилось или чего не хватает. За отзыв мы начислим вам ещё несколько анализов.',
  FEEDBACK_BUTTON: 'Оставить отзыв и получить ещё несколько анализов',
  FEEDBACK_LABEL_TEXT: 'Ваш отзыв',
  FEEDBACK_PLACEHOLDER:
    'Например: «Понравилось, как подробно описаны участники, но хочется ещё больше конкретных рекомендаций…»',
  FEEDBACK_LABEL_CONTACT: 'Контакт для связи (по желанию)',
  FEEDBACK_CONTACT_PLACEHOLDER: '@ник в Telegram или e-mail',
  FEEDBACK_SUBMIT: 'Отправить отзыв',
  FEEDBACK_SUBMITTING: 'Отправляем...',
  FEEDBACK_CANCEL: 'Отмена',
  FEEDBACK_HINT:
    'Мы не передаём отзывы третьим лицам. Они нужны только для улучшения сервиса.',
  FEEDBACK_ERROR:
    'Напишите пару слов, что вам понравилось или не понравилось.',
  FEEDBACK_ERROR_SUBMIT:
    'Не получилось отправить отзыв. Попробуйте чуть позже.',
  FEEDBACK_SUCCESS_WITH_GRANTED: 'Спасибо за отзыв! Мы начислили ещё',
  FEEDBACK_SUCCESS_WITH_GRANTED_SUFFIX: 'запросов.',
  FEEDBACK_SUCCESS:
    'Спасибо за отзыв! Ваше мнение помогает сделать сервис лучше.',

  // Rate Limit
  RATE_LIMIT_DEFAULT:
    'Тестовый лимит анализов исчерпан. Оставьте отзыв — и мы начислим ещё несколько запросов.',

  // Errors
  ERROR_ANALYSIS: 'Ошибка при анализе. Проверь подключение или API.',
  EXPORT_DOCX_NOT_READY: 'Экспорт в .docx пока в разработке :)',

  // FAQ
  FAQ_TITLE: 'Как это работает?',
  FAQ_TELEGRAM_TITLE: 'Telegram',
  FAQ_TELEGRAM_STEPS: [
    'Откройте чат → три точки → «Экспорт чата»',
    'Формат: HTML или TXT',
    'Загрузите полученный файл сюда',
  ],
  FAQ_WHATSAPP_TITLE: 'WhatsApp',
  FAQ_WHATSAPP_STEPS: [
    'Откройте чат → три точки → «Ещё» → «Экспорт»',
    'Выберите «Без медиа»',
    'Загрузите .txt-файл сюда',
  ],
  FAQ_IMAGE_PLACEHOLDER: '',
} as const;
