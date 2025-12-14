import { useEffect, useRef, useState } from 'react';

import { APP_TEXT } from '../../constants';

import styles from './RangeSlider.module.css';

interface RangeSliderProps {
  min: number; // timestamp в миллисекундах
  max: number; // timestamp в миллисекундах
  valueFrom: number; // timestamp в миллисекундах
  valueTo: number; // timestamp в миллисекундах
  onChange: (from: number, to: number) => void;
}

export const RangeSlider = ({ min, max, valueFrom, valueTo, onChange }: RangeSliderProps) => {
  const [isDraggingFrom, setIsDraggingFrom] = useState(false);
  const [isDraggingTo, setIsDraggingTo] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Нормализуем значения в проценты
  const getPercent = (value: number) => {
    if (max === min) return 0;
    return ((value - min) / (max - min)) * 100;
  };

  const percentFrom = getPercent(valueFrom);
  const percentTo = getPercent(valueTo);

  // Конвертируем позицию мыши в значение
  const getValueFromPosition = (clientX: number): number => {
    if (!trackRef.current) return min;

    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const value = min + (percent / 100) * (max - min);

    return Math.round(value);
  };

  // Обработчики для левого ползунка
  const handleMouseDownFrom = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingFrom(true);
  };

  // Обработчики для правого ползунка
  const handleMouseDownTo = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingTo(true);
  };

  // Обработчик движения мыши
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingFrom && !isDraggingTo) return;

      const newValue = getValueFromPosition(e.clientX);

      if (isDraggingFrom) {
        // Левый ползунок не может быть правее правого
        const clampedValue = Math.min(newValue, valueTo);
        if (clampedValue !== valueFrom) {
          onChange(clampedValue, valueTo);
        }
      } else if (isDraggingTo) {
        // Правый ползунок не может быть левее левого
        const clampedValue = Math.max(newValue, valueFrom);
        if (clampedValue !== valueTo) {
          onChange(valueFrom, clampedValue);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingFrom(false);
      setIsDraggingTo(false);
    };

    if (isDraggingFrom || isDraggingTo) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingFrom, isDraggingTo, valueFrom, valueTo, min, max, onChange, getValueFromPosition]);

  // Обработчик клика по треку
  const handleTrackClick = (e: React.MouseEvent) => {
    if (e.target !== trackRef.current) return;

    const newValue = getValueFromPosition(e.clientX);
    const distanceToFrom = Math.abs(newValue - valueFrom);
    const distanceToTo = Math.abs(newValue - valueTo);

    // Двигаем ближайший ползунок
    if (distanceToFrom < distanceToTo) {
      onChange(Math.min(newValue, valueTo), valueTo);
    } else {
      onChange(valueFrom, Math.max(newValue, valueFrom));
    }
  };

  return (
    <div className={styles.rangeSlider}>
      <div ref={trackRef} className={styles.track} onClick={handleTrackClick}>
        {/* Неактивная часть слева */}
        <div className={styles.trackInactive} style={{ width: `${percentFrom}%` }} />

        {/* Активная часть между ползунками */}
        <div
          className={styles.trackActive}
          style={{
            left: `${percentFrom}%`,
            width: `${percentTo - percentFrom}%`,
          }}
        />

        {/* Неактивная часть справа */}
        <div
          className={styles.trackInactive}
          style={{
            left: `${percentTo}%`,
            width: `${100 - percentTo}%`,
          }}
        />

        {/* Левый ползунок */}
        <div
          className={`${styles.thumb} ${isDraggingFrom ? styles.thumbActive : ''}`}
          style={{ left: `${percentFrom}%` }}
          onMouseDown={handleMouseDownFrom}
        >
          <div className={styles.thumbInner} />
        </div>

        {/* Правый ползунок */}
        <div
          className={`${styles.thumb} ${isDraggingTo ? styles.thumbActive : ''}`}
          style={{ left: `${percentTo}%` }}
          onMouseDown={handleMouseDownTo}
        >
          <div className={styles.thumbInner} />
        </div>
      </div>
      <p className={styles.hint}>{APP_TEXT.RANGE_SLIDER_HINT}</p>
    </div>
  );
};
