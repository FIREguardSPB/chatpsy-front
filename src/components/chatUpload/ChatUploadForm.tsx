import type { ChangeEvent } from 'react';
import { useState } from 'react';

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
} from '../../constants';
import styles from './ChatUploadForm.module.css';

interface ChatUploadFormProps {
  onChatReady: (params: ChatPayload) => void;
}

export const ChatUploadForm = ({ onChatReady }: ChatUploadFormProps) => {
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
      console.error("Поддерживаются только файлы .txt и .html");
      return;
    }

    if (rejected.length > 0) {
      console.warn("Проигнорированы файлы с неподдерживаемым форматом:", rejected);
    }

    try {
      const files = allowed.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        }),
      );

      setFileNames(files.map((f) => f.name));
      setTotalSize(files.reduce((sum, f) => sum + f.size, 0));

      const contents = await Promise.all(files.map((f) => f.text()));

      const combined = contents
        .map((content, idx) => {
          const name = files[idx].name;
          return `

<!-- FILE: ${name} -->

${content}`;
        })
        .join("");

      const rawSlice = combined.slice(0, CHAT_PREVIEW_LENGTH);
      setRawPreview(rawSlice);

      const { anonymized, mapping: nameMapping } = anonymizeChat(combined);
      const anonSlice = anonymized.slice(0, CHAT_PREVIEW_LENGTH);
      setAnonPreview(anonSlice);
      setMapping(nameMapping);

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
      <h2 className="card__title">1. Загрузка переписки</h2>
      <p className="card__text">
        Экспортируйте чат и загрузите сюда. Можно выбрать сразу несколько
        файлов одной переписки (например, <code>messages.html</code>,{" "}
        <code>messages1.html</code>, <code>messages2.html</code> и т.д.). Мы
        анонимизируем имена, телефоны и e-mail перед отправкой на сервер.
      </p>

      {/* Красивая кнопка + подпись */}
      <div className={styles.fileInput}>
        <label className={styles.btnUpload}>
          Выбрать файлы
          <input
            type="file"
            accept=".txt,.html,.htm"
            multiple
            onChange={handleFileChange}
            className={styles.fileInputNative}
          />
        </label>
        <span className={styles.fileInputHint}>
          {fileNames.length === 0
            ? "Файл не выбран"
            : "Список выбранных файлов ниже"}
        </span>
      </div>

      {/* блок со списком файлов + размером */}
      {fileNames.length > 0 && (
        <div className={styles.fileList}>
          <span className={styles.fileList__label}>
            Выбрано файлов: <strong>{fileNames.length}</strong>
            {totalSize > 0 && (
              <>
                {" "}
                • общий размер: <strong>{formatBytes(totalSize)}</strong>
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
          Не удалось прочитать файлы. Попробуйте ещё раз.
        </p>
      )}

      {rawPreview && (
        <div className={styles.previewGrid}>
          <div>
            <h3 className={styles.previewTitle}>
              Оригинал (фрагмент, объединённые файлы)
            </h3>
            <pre className={styles.chatFragment}>
              {highlightText(rawPreview, highlightRawConfigs)}
            </pre>
          </div>
          <div>
            <h3 className={styles.previewTitle}>
              Анонимизированный текст (фрагмент)
            </h3>
            <pre className={styles.chatFragment}>
              {highlightText(anonPreview, highlightAnonConfigs)}
            </pre>
          </div>
        </div>
      )}

      {Object.keys(mapping).length > 0 && (
        <details className={styles.mappingDetails}>
          <summary>Показать, кто стал кем (только локально)</summary>
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
