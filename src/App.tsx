import { useState, useEffect } from 'react';

import {
  PageLayout,
  ChatUploadForm,
  AnalysisResult,
  ChatMetaBlock,
  ChatFaqCard,
  FeedbackForm,
  AdminDashboard,
} from './components';
import { ErrorModal } from './components/ErrorModal';
import { ZipErrorModal } from './components/ZipErrorModal';
import { TimeoutErrorModal } from './components/TimeoutErrorModal';
import { useAnalysis, useChatMeta, useFeedback } from './hooks';
import { estimateRangeBytes } from './utils';
import { APP_TEXT } from './constants';
import type { ChatPayload } from './types';
import styles from './App.module.css';

const App = () => {
  // Хуки объявляем в самом начале, до условного return
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [chatPayload, setChatPayload] = useState<ChatPayload | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const [paymentTestMode, setPaymentTestMode] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [zipErrorModalOpen, setZipErrorModalOpen] = useState(false);
  const [timeoutErrorModalOpen, setTimeoutErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [chatUploadKey, setChatUploadKey] = useState(0);

  // Подключаем пользовательские хуки (анализ и получение метаданных)
  const { result, loading, analyze, resetResult } = useAnalysis({
    onRateLimitError: (msg) => {
      setMessageType('error');
      setRateLimitMessage(msg);
    },
    onError: (error) => {
      // Обработка таймаутов и других ошибок
      if (
        error.name === 'TimeoutError' ||
        error.message.includes('timeout') ||
        error.message.includes('Timeout') ||
        error.message.includes('ECONNABORTED')
      ) {
        setTimeoutErrorModalOpen(true);
      } else {
        setErrorMessage(error.message || 'Unknown error');
        setErrorModalOpen(true);
      }
    },
  });

  const {
    meta,
    rangeFrom,
    rangeTo,
    fetchMeta,
    handleRangeChange: updateRange,
    resetMeta,
    loading: metaLoading,
    error: metaError,
  } = useChatMeta();

  const { markFeedbackUsed, shouldShowFeedback } = useFeedback();

  // Загружаем конфиг при монтировании
  useEffect(() => {
    fetch('/debug/config')
      .then((r) => r.json())
      .then((cfg) => {
        setPaymentEnabled(!!cfg.payment_enabled);
        setPaymentTestMode(!!cfg.payment_test_mode);
      })
      .catch(() => {
        setPaymentEnabled(false);
        setPaymentTestMode(false);
      });
  }, []);

  // Отслеживаем ошибки из анализа
  useEffect(() => {
    if (result?.is_fallback) {
      console.error('LLM Analysis Failed:', result.error_message);
      setErrorMessage(result.error_message || 'Unknown error');
      setErrorModalOpen(true);
    }
  }, [result]);

  // Отслеживаем ошибки из useChatMeta
  useEffect(() => {
    if (metaError) {
      if (
        metaError.name === 'TimeoutError' ||
        metaError.message.includes('timeout') ||
        metaError.message.includes('Timeout') ||
        metaError.message.includes('ECONNABORTED')
      ) {
        setTimeoutErrorModalOpen(true);
      } else {
        setErrorMessage(metaError.message || 'Unknown error');
        setErrorModalOpen(true);
      }
    }
  }, [metaError]);

  // Обработчики событий
  const handleChatReady = async (payload: ChatPayload) => {
    setChatPayload(payload);
    resetResult();
    resetMeta();
    setRateLimitMessage(null);
    await fetchMeta(payload.anonymizedText);
  };

  const handleRangeChange = (from: string | null, to: string | null) => {
    updateRange(from, to);
  };

  const handleAnalyze = async () => {
    const approxBytes = meta ? estimateRangeBytes(meta, rangeFrom, rangeTo) : null;
    const isOverLimit = meta && approxBytes !== null && approxBytes > meta.recommended_bytes;
    if (!chatPayload || loading || metaLoading || isOverLimit) return;

    setRateLimitMessage(null);
    setErrorModalOpen(false);
    setErrorMessage(null);

    await analyze(chatPayload.anonymizedText, rangeFrom, rangeTo);
  };

  const handleNewAnalysis = () => {
    resetResult();
    setChatPayload(null);
    resetMeta();
    setChatUploadKey((prev) => prev + 1);
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleFeedbackSent = (granted: number) => {
    markFeedbackUsed(granted);
    setMessageType('success');
    setRateLimitMessage(
      granted > 0
        ? `${APP_TEXT.FEEDBACK_SUCCESS_WITH_GRANTED} ${granted} ${APP_TEXT.FEEDBACK_SUCCESS_WITH_GRANTED_SUFFIX}`
        : APP_TEXT.FEEDBACK_SUCCESS,
    );
  };

  const handleFeedbackSentInResults = (granted: number) => {
    resetResult();
    setMessageType('success');
    setRateLimitMessage(
      granted > 0
        ? `${APP_TEXT.FEEDBACK_SUCCESS_WITH_GRANTED} ${granted} ${APP_TEXT.FEEDBACK_SUCCESS_WITH_GRANTED_SUFFIX}`
        : APP_TEXT.FEEDBACK_SUCCESS,
    );
    markFeedbackUsed(granted);
  };

  const handleZipError = () => {
    setZipErrorModalOpen(true);
  };

  const handleNetworkError = () => {
    setTimeoutErrorModalOpen(true);
  };

  const handleUploadStart = () => {
    setUploadLoading(true);
  };

  const handleUploadEnd = () => {
    setUploadLoading(false);
  };

  // Считаем, админ ли пользователь, после всех хуков
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === '1';

  // Если админ, просто показываем админскую панель и завершаем функцию
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // Вычисляем дополнительные флаги и показатели для анализа и вывода
  const approxBytes = meta ? estimateRangeBytes(meta, rangeFrom, rangeTo) : null;
  const isOverLimit = meta && approxBytes !== null && approxBytes > meta.recommended_bytes;
  const canAnalyze = !!chatPayload && !isOverLimit && !loading && !metaLoading;
  const shouldShowFeedbackForm = !paymentEnabled && shouldShowFeedback(!!rateLimitMessage);

  return (
    <PageLayout>
      {(loading || uploadLoading) && (
        <div className={styles.analyzeModal}>
          <div className={styles.analyzeModal__backdrop} />
          <div className={styles.analyzeModal__panel}>
            <div className={styles.analyzeModal__spinner} />
            <div className={styles.analyzeModal__text}>
              <h2>{APP_TEXT.MODAL_ANALYZING_TITLE}</h2>
              <p>{APP_TEXT.MODAL_ANALYZING_TEXT}</p>
            </div>
          </div>
        </div>
      )}

      {/* FAQ о форматах и объёме файлов */}
      <ChatFaqCard />

      {/* Экран загрузки и анализа */}
      <div style={{ display: !result ? 'block' : 'none' }}>
        <div className='content-grid'>
          <div className='content-column'>
            <ChatUploadForm
              onChatReady={handleChatReady}
              onError={handleZipError}
              onNetworkError={handleNetworkError}
              onUploadStart={handleUploadStart}
              onUploadEnd={handleUploadEnd}
              key={chatUploadKey}
            />
          </div>

          <div className='content-column'>
            <AnalysisResult
              mode='inline'
              result={null}
              loading={loading}
              onAnalyzeClick={handleAnalyze}
              canAnalyze={canAnalyze}
              rateLimitMessage={paymentEnabled ? null : rateLimitMessage}
              messageType={messageType}
              paymentEnabled={paymentEnabled}
              paymentTestMode={paymentTestMode}
              hasFileUploaded={!!chatPayload}
              isOverLimit={isOverLimit ?? undefined}
            />

            {/* Лоадер метаданных: файл загружен, meta ещё нет */}
            {chatPayload && !meta && (
              <section className='card meta-card meta-card--loading'>
                <h2 className='card__title'>{APP_TEXT.META_LOADING_TITLE}</h2>
                <p className='card__text'>{APP_TEXT.META_LOADING_TEXT}</p>
                <div className='meta-loader'>
                  <div className='meta-loader__spinner' />
                  <span className='meta-loader__label'>{APP_TEXT.META_LOADING_LABEL}</span>
                </div>
              </section>
            )}

            {/* Форма отзыва под кнопкой анализа */}
            {shouldShowFeedbackForm && (
              <FeedbackForm onSent={handleFeedbackSent} initialOpen={true} />
            )}

            {/* Блок выбора диапазона и отображения объёма текста */}
            {meta && (
              <ChatMetaBlock
                meta={meta}
                rangeFrom={rangeFrom}
                rangeTo={rangeTo}
                onRangeChange={handleRangeChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Экран результатов */}
      <div style={{ display: result ? 'block' : 'none' }}>
        <AnalysisResult
          mode='results'
          result={result}
          loading={loading}
          onAnalyzeClick={handleAnalyze}
          canAnalyze={canAnalyze}
          onNewAnalysis={handleNewAnalysis}
          onExportPdf={handleExportPdf}
          paymentEnabled={paymentEnabled}
          paymentTestMode={paymentTestMode}
          onFeedbackSent={handleFeedbackSentInResults}
          nameMapping={chatPayload?.mapping}
        />
      </div>

      {/* Модальные окна для ошибок */}
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errorMessage={errorMessage || undefined}
      />
      <ZipErrorModal isOpen={zipErrorModalOpen} onClose={() => setZipErrorModalOpen(false)} />
      <TimeoutErrorModal
        isOpen={timeoutErrorModalOpen}
        onClose={() => setTimeoutErrorModalOpen(false)}
      />
    </PageLayout>
  );
};

export default App;

