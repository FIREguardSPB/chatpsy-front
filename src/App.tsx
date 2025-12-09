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
import { useAnalysis, useChatMeta, useFeedback } from './hooks';
import { estimateRangeBytes } from './utils';
import { APP_TEXT } from './constants';
import type { ChatPayload } from './types';
import styles from './App.module.css';

const App = () => {
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === '1';
  if (isAdmin) {
    return <AdminDashboard />;
  }
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [chatPayload, setChatPayload] = useState<ChatPayload | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const [paymentTestMode, setPaymentTestMode] = useState(false);
  const [feedbackSuccessMessage, setFeedbackSuccessMessage] = useState<string | null>(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [chatUploadKey, setChatUploadKey] = useState(0);
  // Load payment_enabled from backend on mount
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

  const { result, loading, analyze, resetResult } = useAnalysis({
    onRateLimitError: (msg) => {
      setMessageType('error');
      setRateLimitMessage(msg);
    },
  });

  // Отслеживаем изменения result и проверяем на is_fallback
  useEffect(() => {
    if (result?.is_fallback) {
      console.error('LLM Analysis Failed:', result.error_message);
      setErrorMessage(result.error_message || 'Unknown error');
      setErrorModalOpen(true);
    }
  }, [result]);

  const { meta, rangeFrom, rangeTo, fetchMeta, handleRangeChange: updateRange, resetMeta, loading: metaLoading } =
    useChatMeta();

  const { markFeedbackUsed, shouldShowFeedback } = useFeedback();

  const approxBytes =
    meta ? estimateRangeBytes(meta, rangeFrom, rangeTo) : null;
  const isOverLimit =
    meta && approxBytes !== null && approxBytes > meta.recommended_bytes;

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
    setFeedbackSuccessMessage(null);
    // Сбрасываем ChatUploadForm, чтобы он забыл предыдущий файл
    setChatUploadKey(prev => prev + 1);
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleExportDocx = () => {
    alert(APP_TEXT.EXPORT_DOCX_NOT_READY);
  };

  const canAnalyze = !!chatPayload && !isOverLimit && !loading && !metaLoading;

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
    // Сбрасываем результат, возвращаемся на стартовый экран
    // chatPayload и ChatUploadForm сохраняют состояние файла
    resetResult();
    setMessageType('success');
    setRateLimitMessage(
      granted > 0
        ? `${APP_TEXT.FEEDBACK_SUCCESS_WITH_GRANTED} ${granted} ${APP_TEXT.FEEDBACK_SUCCESS_WITH_GRANTED_SUFFIX}`
        : APP_TEXT.FEEDBACK_SUCCESS,
    );
    markFeedbackUsed(granted);
  };

  const shouldShowFeedbackForm = !paymentEnabled && shouldShowFeedback(!!rateLimitMessage);

  return (
    <PageLayout>
      {/* 🔹 Модальное окно поверх main: только во время анализа */}
      {loading && (
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

      {/* Экран загрузки + анализ + мета + FAQ */}
      <div style={{ display: !result ? 'block' : 'none' }}>
        <div className="content-grid">
          <div className="content-column">
            <ChatUploadForm onChatReady={handleChatReady} key={chatUploadKey} />
          </div>

            <div className="content-column">
              <AnalysisResult
                mode="inline"
                result={null}
                loading={loading}
                onAnalyzeClick={handleAnalyze}
                canAnalyze={canAnalyze}
                rateLimitMessage={paymentEnabled ? null : rateLimitMessage}
                messageType={messageType}
                paymentEnabled={paymentEnabled}
                paymentTestMode={paymentTestMode}
              />

              {/* 🔹 Лоадер метаданных: чат уже есть, meta ещё нет */}
              {chatPayload && !meta && (
                <section className="card meta-card meta-card--loading">
                  <h2 className="card__title">Диапазон и объём данных</h2>
                  <p className="card__text">
                    Считаем объём переписки и диапазон дат… Это может занять
                    немного времени при больших файлах.
                  </p>
                  <div className="meta-loader">
                    <div className="meta-loader__spinner" />
                    <span className="meta-loader__label">
                      Анализируем структуру чата…
                    </span>
                  </div>
                </section>
              )}

              {/* форма отзыва — блок под кнопкой анализа */}
              {shouldShowFeedbackForm && (
                <FeedbackForm onSent={handleFeedbackSent} initialOpen={true} />
              )}

              {/* блок диапазона/объёма */}
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

          <ChatFaqCard />
        </div>

      {/* Экран результатов */}
      <div style={{ display: result ? 'block' : 'none' }}>
        <AnalysisResult
          mode="results"
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

      {/* Модальное окно ошибки */}
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errorMessage={errorMessage || undefined}
      />
    </PageLayout>
  );
};

export default App;
