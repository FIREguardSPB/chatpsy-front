import type { AnalyzeResponse } from '../../types';
import { useEffect, useMemo, useState } from 'react';
import { ParticipantsList } from './ParticipantsList';
import { RelationshipCard } from './RelationshipCard';
import { RecommendationsList } from './RecommendationsList';
import { StatsBlock } from './StatsBlock';
import { FeedbackForm } from '../feedback/FeedbackForm';
import { FEEDBACK_FLAG_KEY, PARTICIPANT_COLORS } from '../../constants';
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
      <section className='results-layout'>
        <div className='results-header'>
          <div>
            <h2 className='section-title'>Результаты анализа</h2>
            <p className='section-subtitle'>
              Психологический портрет участников, динамика отношений и практические рекомендации на
              основе вашей переписки.
            </p>
          </div>
          <div className='results-actions'>
            {onExportPdf && (
              <button type='button' className='btn-secondary' onClick={onExportPdf}>
                Сохранить как PDF
              </button>
            )}
            {onExportDocx && (
              <button type='button' className='btn-secondary' onClick={onExportDocx}>
                Скачать .docx
              </button>
            )}
            {onNewAnalysis && (
              <button type='button' className='btn-outline' onClick={onNewAnalysis}>
                Новый анализ
              </button>
            )}
          </div>
        </div>

        {showFeedbackBlock && (
          showFeedbackForm ? (
            <FeedbackForm onSent={handleFeedbackSent} initialOpen={true} />
          ) : (
            <div className='card card--action' style={{ marginBottom: 24 }}>
              <h3 className='card__title'>Получить бонусные анализы</h3>
              <p className='card__text'>
                Бесплатные анализы закончились. Вы можете оставить отзыв и получить дополнительный бонус.
              </p>
              <button
                type='button'
                onClick={() => setShowFeedbackForm(true)}
                disabled={loading}
                className='analyze-btn'
              >
                Оставить отзыв
              </button>
            </div>
          )
        )}

        {showPaymentBlock && (
          <div className='card card--action' style={{ marginBottom: 24 }}>
            <h3 className='card__title'>Доступ к полному анализу</h3>
            <p className='card__text'>
              Анализ представлен на 10% от общего анализа. Полный анализ будет открыт после оплаты.
            </p>
            <button
              type='button'
              onClick={handlePay}
              disabled={loading}
              className='analyze-btn'
            >
              Оплатить
            </button>
            {unlockedResult && (
              <p className='card__hint'>Спасибо за оплату. Текст результата анализа полностью открыт</p>
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
        <h2 className='card__title'>2. Анализ</h2>
        <p className='card__text'>
          После загрузки переписки нажмите кнопку ниже, чтобы получить психологический разбор и
          рекомендации.
        </p>
        {showAnalyzeButton ? (
          <button
            type='button'
            onClick={onAnalyzeClick}
            disabled={loading || !canAnalyze}
            className='analyze-btn'
          >
            {loading ? 'АНАЛИЗИРУЕМ...' : 'Проанализировать переписку'}
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
              Оплатить
            </button>
            <p className='card__hint'>
              Анализ представлен на 10% от общего анализа. Полный анализ будет открыт после оплаты.
            </p>
            {unlockedResult && (
              <p className='card__hint'>Спасибо за оплату. Текст результата анализа полностью открыт</p>
            )}
          </>
        )}

        {!canAnalyze && (
          <p className={'card__hint' + (isOverLimit ? ' card__hint--warn' : '')}>
            {isOverLimit
              ? 'Объём выбранного диапазона выше рекомендуемого. Уменьшите период или сузьте даты.'
              : 'Сначала загрузите файл с перепиской.'}
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
                    Тестовый лимит анализов исчерпан для этого устройства. Напишите <a href="mailto:antonluba@rambler.ru">нам</a>, и мы добавим Вам еще запросы.
                  </>
                ) : (
                  <>Тестовый лимит анализов исчерпан для этого устройства.</>
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
