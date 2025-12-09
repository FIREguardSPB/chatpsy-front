import { useEffect } from 'react';

import type { ChatMetaResponse } from '../../types';
import {
  formatBytes,
  estimateRangeBytes,
  formatDateLabel,
} from '../../utils';
import styles from './ChatMetaBlock.module.css';

interface ChatMetaBlockProps {
  meta: ChatMetaResponse | null;
  rangeFrom: string | null;
  rangeTo: string | null;
  onRangeChange: (from: string | null, to: string | null) => void;
  onLimitChange?: (info: {
    approxBytes: number | null;
    isOverLimit: boolean;
  }) => void;
}

export const ChatMetaBlock = ({
                                meta,
                                rangeFrom,
                                rangeTo,
                                onRangeChange,
                                onLimitChange,
                              }: ChatMetaBlockProps) => {
  // считаем, даже если meta = null (тогда просто будет null)
  const approxRangeBytes = meta
    ? estimateRangeBytes(meta, rangeFrom, rangeTo)
    : null;

  const isOverLimit =
    !!meta &&
    approxRangeBytes !== null &&
    approxRangeBytes > meta.recommended_bytes;

  // сообщаем App объём и флаг
  useEffect(() => {
    if (!onLimitChange) return;
    onLimitChange({ approxBytes: approxRangeBytes, isOverLimit });
  }, [approxRangeBytes, isOverLimit, onLimitChange]);

  if (!meta) return null;

  const handleFromChange = (value: string) => {
    onRangeChange(value || null, rangeTo);
  };

  const handleToChange = (value: string) => {
    onRangeChange(rangeFrom, value || null);
  };

  return (
    <section className={`card ${styles.metaCard}`}>
      <h2 className="card__title">Диапазон и объём данных</h2>
      <p className="card__text">
        Выберите период переписки. Мы оценим, сколько текста попадёт в модель.
        Для тестового режима лучше держаться в рамках рекомендуемого объёма.
      </p>

      <div className={styles.metaRange}>
        <div className={styles.metaRange__fields}>
          <label className={styles.metaRange__field}>
            <span className={styles.metaRange__label}>С</span>
            <input
              type="date"
              value={rangeFrom ?? ""}
              onChange={(e) => handleFromChange(e.target.value)}
            />
          </label>
          <label className={styles.metaRange__field}>
            <span className={styles.metaRange__label}>По</span>
            <input
              type="date"
              value={rangeTo ?? ""}
              onChange={(e) => handleToChange(e.target.value)}
            />
          </label>
        </div>
        <p className={styles.metaRange__hint}>
          Диапазон в экспорте:{" "}
          <strong>
            {formatDateLabel(meta.stats.first_message_at)} —{" "}
            {formatDateLabel(meta.stats.last_message_at)}
          </strong>
          .
        </p>
      </div>

      <div className={styles.metaStatsRow}>
        <div className={styles.metaStat}>
          <span className={styles.metaStat__label}>Всего загружено</span>
          <span className={styles.metaStat__value}>
            {formatBytes(meta.upload_bytes)}
          </span>
        </div>
        <div className={styles.metaStat}>
          <span className={styles.metaStat__label}>
            В модель при выбранном диапазоне (оценочно)
          </span>
          <span
            className={`${styles.metaStat__value} ${
              isOverLimit ? styles['metaStat__value--warn'] : ''
            }`}
          >
            {approxRangeBytes !== null ? formatBytes(approxRangeBytes) : "—"}
          </span>
        </div>
      </div>

      <p className={styles.metaRange__limit}>
        Рекомендуемый объём для одного анализа:{" "}
        <strong>{formatBytes(meta.recommended_bytes)}</strong>. Если оценка
        выше — лучше сузить период.
      </p>
    </section>
  );
}
