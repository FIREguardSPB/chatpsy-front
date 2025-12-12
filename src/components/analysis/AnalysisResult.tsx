import type { AnalyzeResponse } from '../../types';
import { useEffect, useState } from 'react';
import { ParticipantsList } from './ParticipantsList';
import { RelationshipCard } from './RelationshipCard';
import { RecommendationsList } from './RecommendationsList';
import { StatsBlock } from './StatsBlock';
import { FeedbackForm } from '../feedback/FeedbackForm';
import { FEEDBACK_FLAG_KEY, APP_TEXT } from '../../constants';
import styles from './AnalysisResult.module.css';
import { createPayment, getFullAnalysis } from '../../api/admin';

type Mode = 'inline' | 'results';

interface AnalysisResultProps {
  result: AnalyzeResponse | null;
  loading: boolean;
  onAnalyzeClick: () => void;
  canAnalyze?: boolean;
  mode?: Mode;
  onNewAnalysis?: () => void;
  onExportPdf?: () => void;
  onExportDocx?: () => void;
  isOverLimit?: boolean;
  rateLimitMessage?: string | null;
  messageType?: 'error' | 'success';
  onLeaveFeedback?: () => void;
  paymentEnabled?: boolean;
  paymentTestMode?: boolean;
  onFeedbackSent?: (granted: number) => void;
  nameMapping?: Record<string, string>;
  hasFileUploaded?: boolean; // Новое свойство
}

export const AnalysisResult = ({
  result,
  loading,
  onAnalyzeClick,
  canAnalyze,
  mode = 'inline',
  onNewAnalysis,
  onExportPdf,
  onExportDocx,
  isOverLimit,
  rateLimitMessage,
  messageType = 'error',
  paymentEnabled = false,
  paymentTestMode = false,
  onFeedbackSent,
  nameMapping,
  hasFileUploaded, // Новое свойство
}: AnalysisResultProps) => {
  const [unlockedResult, setUnlockedResult] = useState<AnalyzeResponse | null>(null);
  const effectiveResult = unlockedResult ?? result;
  const isPreview = !!effectiveResult?.is_preview;
  const paymentRequired = !!effectiveResult?.payment_required;
  const hasAnalysisId = !!effectiveResult?.analysis_id;

  // Читаем флаг напрямую из localStorage при каждом рендере
  const feedbackUsed = typeof window !== 'undefined'
    ? window.localStorage.getItem(FEEDBACK_FLAG_KEY) === '1'
    : false;

  const showAnalyzeButton =
    !paymentEnabled || !isPreview || !paymentRequired || !hasAnalysisId;

  const [myStats, setMyStats] = useState<any | null>(null);
  const [feedbackBonus, setFeedbackBonus] = useState<number>(0);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  /* Unused participantLegend
  const participantLegend = useMemo(() => {
    if (nameMapping && Object.keys(nameMapping).length > 0) {
      // Полная легенда с маппингом: Реальное имя → USER_*
      return Object.entries(nameMapping).map(([realName, alias]) => ({
        id: alias,
        realName,
        className: PARTICIPANT_COLORS[alias] ?? 'user-chip-default',
      }));
    }
    // Упрощённая легенда: только USER_*
    return Object.entries(PARTICIPANT_COLORS).map(([id, className]) => ({
      id,
      realName: null,
      className,
    }));
  }, [nameMapping]);
  */

  // Подгружаем конфиг и статистику при маунте
  useEffect(() => {
    if (!paymentEnabled) return;
    (async () => {
      try {
        const cfg = await fetch('http://127.0.0.1:8000/debug/config').then(r => r.json());
        setFeedbackBonus(Number(cfg.feedback_bonus_analyses || 0));
      } catch {}
      try {
        const stats = await fetch('http://127.0.0.1:8000/my_stats').then(r => r.json());
        setMyStats(stats);
      } catch {}
    })();
  }, [paymentEnabled]);

  const showFeedbackBlock =
    paymentEnabled && isPreview && paymentRequired && hasAnalysisId &&
    feedbackBonus > 0 && myStats && myStats.feedback_bonus_used === false;

  const showPaymentBlock =
    paymentEnabled && isPreview && paymentRequired && hasAnalysisId && !showFeedbackBlock;

  const handleFeedbackSent = async (granted: number) => {
    setShowFeedbackForm(false);
    // Перезагружаем статистику
    try {
      const stats = await fetch('http://127.0.0.1:8000/my_stats').then(r => r.json());
      setMyStats(stats);
    } catch {}
    // Вызываем колбэк из родителя, чтобы сбросить результат
    if (onFeedbackSent) {
      onFeedbackSent(granted);
    }
  };

  const handlePay = async () => {
    if (!effectiveResult?.analysis_id) return;
    try {
      const returnUrl = window.location.href;
      const { payment_url } = await createPayment(effectiveResult.analysis_id, returnUrl);
      if (paymentTestMode) {
        window.open(payment_url, '_blank');
      } else {
        window.location.href = payment_url;
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!paymentEnabled) return;
    const params = new URLSearchParams(window.location.search);
    const paidAnalysisId = params.get('analysis_id');
    const paidStatus = params.get('status');

    if (paidAnalysisId && paidStatus === 'success') {
      (async () => {
        try {
          const full = await getFullAnalysis(paidAnalysisId);
          setUnlockedResult(full);
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }, [paymentEnabled]);

  useEffect(() => {
    // Тестовый режим: опциональный поллинг на случай, если отметили "оплачено" из админки,
    // а пользователь ещё находится на странице.
    if (!paymentEnabled || !paymentTestMode || !paymentRequired || !hasAnalysisId || unlockedResult) return;
    const analysisId = effectiveResult?.analysis_id;
    if (!analysisId) return;
    let active = true;
    const tick = async () => {
      try {
        const full = await getFullAnalysis(analysisId);
        if (active) setUnlockedResult(full);
      } catch {}
      if (active) setTimeout(tick, 2000);
    };
    tick();
    return () => { active = false; };
  }, [paymentEnabled, paymentTestMode, paymentRequired, hasAnalysisId, unlockedResult, effectiveResult]);

  // -------- Экран результатов --------
  if (mode === 'results' && effectiveResult) {
    return (
      <section className={styles.resultsLayout}>
        <div className={styles.resultsHeader}>
          <div>
            <h2 className={styles.sectionTitle}>{APP_TEXT.RESULTS_TITLE}</h2>
            <p className={styles.sectionSubtitle}>
              {APP_TEXT.RESULTS_SUBTITLE}
            </p>
          </div>
          <div className={styles.resultsActions}>
            {onExportPdf && (
              <button type='button' className={styles.btnSecondary} onClick={onExportPdf}>
                {APP_TEXT.RESULTS_EXPORT_PDF}
              </button>
            )}
            {onExportDocx && (
              <button type='button' className={styles.btnSecondary} onClick={onExportDocx}>
                {APP_TEXT.RESULTS_EXPORT_DOCX}
              </button>
            )}
            {onNewAnalysis && (
              <button type='button' className={styles.btnOutline} onClick={onNewAnalysis}>
                {APP_TEXT.RESULTS_NEW_ANALYSIS}
              </button>
            )}
          </div>
        </div>

        {showFeedbackBlock && (
          showFeedbackForm ? (
            <FeedbackForm onSent={handleFeedbackSent} initialOpen={true} />
          ) : (
            <div className={styles.card + ' card--action'} style={{ marginBottom: 24 }}>
              <h3 className={styles.card__title}>{APP_TEXT.FEEDBACK_BONUS_TITLE}</h3>
              <p className={styles.card__text}>
                {APP_TEXT.FEEDBACK_BONUS_DESCRIPTION}
              </p>
              <button
                type='button'
                onClick={() => setShowFeedbackForm(true)}
                disabled={loading}
                className='analyze-btn'
              >
                {APP_TEXT.FEEDBACK_TITLE}
              </button>
            </div>
          )
        )}

        {showPaymentBlock && (
          <div className='card card--action' style={{ marginBottom: 24 }}>
            <h3 className='card__title'>{APP_TEXT.PAYMENT_TITLE}</h3>
            <p className='card__text'>
              {APP_TEXT.PAYMENT_DESCRIPTION}
            </p>
            <button
              type='button'
              onClick={handlePay}
              disabled={loading}
              className='analyze-btn'
            >
              {APP_TEXT.PAYMENT_BUTTON}
            </button>
            {unlockedResult && (
              <p className='card__hint'>{APP_TEXT.PAYMENT_SUCCESS}</p>
            )}
          </div>
        )}

        <div className='results-grid'>
          <ParticipantsList participants={effectiveResult.participants} nameMapping={nameMapping} />
          <RelationshipCard relationship={effectiveResult.relationship} />
          <RecommendationsList recommendations={effectiveResult.recommendations} />
          <StatsBlock stats={effectiveResult.stats} />
        </div>
      </section>
    );
  }

  // -------- Правый столбец на стартовом экране --------
  return (
    <>
      <section className='card card--action'>
        <h2 className='card__title'>{APP_TEXT.ANALYSIS_TITLE}</h2>
        <p className='card__text'>
          {APP_TEXT.ANALYSIS_DESCRIPTION}
        </p>
        {showAnalyzeButton ? (
          <button
            type='button'
            onClick={onAnalyzeClick}
            disabled={loading || !canAnalyze}
            className='analyze-btn'
          >
            {loading ? APP_TEXT.ANALYSIS_BUTTON_LOADING : APP_TEXT.ANALYSIS_BUTTON}
            {loading ? <div className="meta-loader__spinner"/> : ''}
          </button>
        ) : (
          <>
            <button
              type='button'
              onClick={handlePay}
              disabled={loading}
              className='analyze-btn'
            >
              {APP_TEXT.PAYMENT_BUTTON}
            </button>
            <p className='card__hint'>
              {APP_TEXT.PAYMENT_DESCRIPTION}
            </p>
            {unlockedResult && (
              <p className='card__hint'>{APP_TEXT.PAYMENT_SUCCESS}</p>
            )}
          </>
        )}

        {/* Удалено: старая логика отображения сообщений */}
        {/* 
        {!canAnalyze && (
          <p className={'card__hint' + (isOverLimit ? ' card__hint--warn' : '')}>
            {isOverLimit
              ? APP_TEXT.ANALYSIS_HINT_OVER_LIMIT
              : APP_TEXT.ANALYSIS_HINT_UPLOAD_FIRST}
          </p>
        )}
        */}

        {/* Новое сообщение под кнопкой анализа - только при превышении лимита и наличии файла */}
        {hasFileUploaded && isOverLimit && (
          <p className="card__hint card__hint--warn">
            Сократите период выборки
          </p>
        )}

        {!paymentEnabled && rateLimitMessage && (
          <div className={messageType === 'success' ? styles.successAlert : styles.rateLimitAlert}>
            <div className={messageType === 'success' ? styles.successAlert__icon : styles.rateLimitAlert__icon}>
              {messageType === 'success' ? '✅' : '⚠️'}
            </div>
            <div className={messageType === 'success' ? styles.successAlert__content : styles.rateLimitAlert__content}>
              <p className={messageType === 'success' ? styles.successAlert__text : styles.rateLimitAlert__text}>
                {messageType === 'success' ? (
                  rateLimitMessage
                ) : feedbackUsed ? (
                  <>
                    {APP_TEXT.RATE_LIMIT_CONTACT} <a href={`mailto:${APP_TEXT.RATE_LIMIT_EMAIL}`}>{APP_TEXT.RATE_LIMIT_CONTACT_SUFFIX}</a>
                  </>
                ) : (
                  <>{APP_TEXT.RATE_LIMIT_EXHAUSTED}</>
                )}
              </p>
            </div>
          </div>
        )}
      </section>

      {effectiveResult && (
        <>
          <ParticipantsList participants={effectiveResult.participants} nameMapping={nameMapping} />
          <RelationshipCard relationship={effectiveResult.relationship} />
          <RecommendationsList recommendations={effectiveResult.recommendations} />
          <StatsBlock stats={effectiveResult.stats} />
        </>
      )}
    </>
  );
};
APP_TEXT
