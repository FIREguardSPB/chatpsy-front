import type { ChangeEvent } from 'react';
import { useState } from 'react';
import axios from 'axios';

import type { FileStatus, ChatPayload } from '../../types';
import {
  anonymizeChat,
  formatBytes,
  highlightText,
  type HighlightConfig,
} from '../../utils';
import {
  ALLOWED_FILE_EXTENSIONS,
  PARTICIPANT_COLORS,
  CHAT_PREVIEW_LENGTH,
  APP_TEXT,
} from '../../constants';
import { processZipFile } from '../../api/chatAnalyzer';
import styles from './ChatUploadForm.module.css';

// Добавляем импорт для работы с ZIP-файлами

interface ChatUploadFormProps {
  onChatReady: (params: ChatPayload) => void;
  onError?: () => void; // Обработчик для ошибок содержимого ZIP-файлов
  onNetworkError?: () => void; // Обработчик для сетевых ошибок
  onUploadStart?: () => void; // Добавляем пропс для начала загрузки
  onUploadEnd?: () => void; // Добавляем пропс для окончания загрузки
}

export const ChatUploadForm = ({ onChatReady, onError, onNetworkError, onUploadStart, onUploadEnd }: ChatUploadFormProps) => {
  const [fileStatus, setFileStatus] = useState<FileStatus>("idle");
  const [rawPreview, setRawPreview] = useState("");
  const [anonPreview, setAnonPreview] = useState("");
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [totalSize, setTotalSize] = useState<number>(0);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) {
      setFileStatus("idle");
      setFileNames([]);
      setTotalSize(0);
      setRawPreview("");
      setAnonPreview("");
      setMapping({});
      return;
    }

    // Разделяем на разрешённые и отбракованные
    const allFiles = Array.from(fileList);
    const allowed: File[] = [];
    const rejected: File[] = [];

    for (const f of allFiles) {
      const lower = f.name.toLowerCase();
      if (ALLOWED_FILE_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
        allowed.push(f);
      } else {
        rejected.push(f);
      }
    }

    if (allowed.length === 0) {
      setFileStatus("error");
      const errorMsg = "Поддерживаются только файлы .txt, .html и .zip";
      console.error(errorMsg);
      if (onError) {
        onError();
      }
      return;
    }

    if (rejected.length > 0) {
      console.warn("Проигнорированы файлы с неподдерживаемым форматом:", rejected);
    }

    try {
      // Уведомляем о начале загрузки
      if (onUploadStart) {
        onUploadStart();
      }

      // Обрабатываем ZIP-файлы
      let combinedContent = "";
      const processedFileNames: string[] = [];
      let totalProcessedSize = 0;

      for (const file of allowed) {
        if (file.name.toLowerCase().endsWith('.zip')) {
          // Отправляем ZIP-файл на сервер для обработки
          try {
            const chatText = await processZipFile(file);
            combinedContent += chatText;
            processedFileNames.push(file.name);
            totalProcessedSize += file.size;
          } catch (error: any) {
            setFileStatus("error");
            console.error("Ошибка при обработке ZIP-файла:", error);

            // Проверяем, является ли ошибка сетевой
            if (axios.isAxiosError(error) &&
                (error.code === 'ECONNABORTED' ||
                 error.code === 'ECONNREFUSED' ||
                 error.message.includes('Network Error') ||
                 error.message.includes('timeout') ||
                 error.message.includes('Timeout'))) {
              // Для сетевых ошибок вызываем специальный обработчик
              if (onNetworkError) {
                onNetworkError();
              } else if (onError) {
                onError();
              }
            } else {
              // Для ошибок содержимого ZIP-файлов отображаем специальное сообщение
              if (onError) {
                onError();
              }
            }

            // Уведомляем об окончании загрузки
            if (onUploadEnd) {
              onUploadEnd();
            }
            return;
          }
        } else {
          // Обычные файлы обрабатываем как раньше
          const content = await file.text();
          combinedContent += `

<!-- FILE: ${file.name} -->

${content}`;
          processedFileNames.push(file.name);
          totalProcessedSize += file.size;
        }
      }

      // Уведомляем об окончании загрузки
      if (onUploadEnd) {
        onUploadEnd();
      }

      const rawSlice = combinedContent.slice(0, CHAT_PREVIEW_LENGTH);
      setRawPreview(rawSlice);

      const { anonymized, mapping: nameMapping } = anonymizeChat(combinedContent);
      const anonSlice = anonymized.slice(0, CHAT_PREVIEW_LENGTH);
      setAnonPreview(anonSlice);
      setMapping(nameMapping);

      setFileNames(processedFileNames);
      setTotalSize(totalProcessedSize);
      setFileStatus("loaded");

      onChatReady({
        anonymizedText: anonymized,
        rawPreview: rawSlice,
        anonPreview: anonSlice,
        mapping: nameMapping,
      });
    } catch (err) {
      console.error(err);
      setFileStatus("error");
      // Уведомляем об окончании загрузки
      if (onUploadEnd) {
        onUploadEnd();
      }
      if (onError) {
        onError();
      }
    }
  };

  // ---- конфиги подсветки для превью ----
  const highlightRawConfigs: HighlightConfig[] = Object.entries(mapping).map(
    ([orig, alias]) => ({
      label: orig,
      className: PARTICIPANT_COLORS[alias] ?? "user-chip-default",
    }),
  );

  const highlightAnonConfigs: HighlightConfig[] = Object.entries(mapping).map(
    ([_, alias]) => ({
      label: alias,
      className: PARTICIPANT_COLORS[alias] ?? "user-chip-default",
    }),
  );

  return (
    <section className="card">
      <h2 className="card__title">{APP_TEXT.UPLOAD_TITLE}</h2>
      <p className="card__text">
        {APP_TEXT.UPLOAD_DESCRIPTION}
      </p>

      {/* Красивая кнопка + подпись */}
      <div className={styles.fileInput}>
        <label className={styles.btnUpload}>
          {APP_TEXT.UPLOAD_BUTTON}
          <input
            type="file"
            accept=".txt,.html,.htm,.zip"
            multiple
            onChange={handleFileChange}
            className={styles.fileInputNative}
          />
        </label>
        <span className={styles.fileInputHint}>
          {fileNames.length === 0
            ? APP_TEXT.UPLOAD_NO_FILE
            : APP_TEXT.UPLOAD_FILES_SELECTED}
        </span>
      </div>

      {/* блок со списком файлов + размером */}
      {fileNames.length > 0 && (
        <div className={styles.fileList}>
          <span className={styles.fileList__label}>
            {APP_TEXT.UPLOAD_FILES_COUNT} <strong>{fileNames.length}</strong>
            {totalSize > 0 && (
              <>
                {" "}
                • {APP_TEXT.UPLOAD_TOTAL_SIZE} <strong>{formatBytes(totalSize)}</strong>
              </>
            )}
          </span>
          <ul className={styles.fileList__items}>
            {fileNames.map((name) => (
              <li key={name} className={styles.fileList__item}>
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {fileStatus === "error" && (
        <p className="text-error">
          {APP_TEXT.UPLOAD_ERROR}
        </p>
      )}

      {rawPreview && (
        <div className={styles.previewGrid}>
          <div>
            <h3 className={styles.previewTitle}>
              {APP_TEXT.UPLOAD_PREVIEW_ORIGINAL}
            </h3>
            <pre className={styles.chatFragment}>
              {highlightText(rawPreview, highlightRawConfigs)}
            </pre>
          </div>
          <div>
            <h3 className={styles.previewTitle}>
              {APP_TEXT.UPLOAD_PREVIEW_ANONYMIZED}
            </h3>
            <pre className={styles.chatFragment}>
              {highlightText(anonPreview, highlightAnonConfigs)}
            </pre>
          </div>
        </div>
      )}

      {Object.keys(mapping).length > 0 && (
        <details className={styles.mappingDetails}>
          <summary>{APP_TEXT.UPLOAD_MAPPING_SHOW}</summary>
          <ul className={styles.mappingList}>
            {Object.entries(mapping).map(([orig, alias]) => {
              const cls = PARTICIPANT_COLORS[alias] ?? "user-chip-default";
              return (
                <li key={orig}>
                  <span className={cls}>{orig}</span> →{" "}
                  <span className={cls}>{alias}</span>
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </section>
  );
}
