import type { ChatStats } from "../../types/api";

interface StatsBlockProps {
  stats: ChatStats;
}

export const StatsBlock = ({ stats }: StatsBlockProps) => {
  if (!stats || !stats.total_messages) return null;

  const formatDateTime = (value: string | null) => {
    if (!value) return "—";
    try {
      const d = new Date(value);
      return d.toLocaleString();
    } catch {
      return value;
    }
  };

  return (
    <section className="card">
      <h2 className="card__title">Статистика</h2>

      <p className="card__text">
        Всего сообщений: <strong>{stats.total_messages}</strong>
      </p>

      {stats.first_message_at && stats.last_message_at && (
        <p className="card__text">
          Диапазон переписки:{" "}
          <strong>{formatDateTime(stats.first_message_at)}</strong> —{" "}
          <strong>{formatDateTime(stats.last_message_at)}</strong>
        </p>
      )}

      {stats.participants.length > 0 && (
        <>
          <h3 className="preview-title" style={{ marginTop: 10 }}>
            Сообщений по участникам
          </h3>
          <ul className="list">
            {stats.participants.map((p) => (
              <li key={p.id}>
                <strong>{p.id}</strong>: {p.messages_count} сообщений,
                средняя длина {p.avg_message_length}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

