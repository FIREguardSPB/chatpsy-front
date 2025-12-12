import type { ParticipantProfile } from "../../types/api";
import { PARTICIPANT_COLORS } from "../../constants";
import { highlightText, type HighlightConfig } from "../../utils/textHighlight";

const PARTICIPANT_HIGHLIGHTS: HighlightConfig[] = Object.entries(
  PARTICIPANT_COLORS,
).map(([id, className]) => ({
  label: id,
  className,
}));

interface ParticipantsListProps {
  participants: ParticipantProfile[];
  nameMapping?: Record<string, string>;
}

export const ParticipantsList = ({ participants, nameMapping }: ParticipantsListProps) => {
  if (!participants.length) return null;

  const colorKeys = Object.keys(PARTICIPANT_COLORS);
  const getChipClass = (idx: number) => PARTICIPANT_COLORS[colorKeys[idx % colorKeys.length]];

  const hasMapping = nameMapping && Object.keys(nameMapping).length > 0;

  return (
    <section className="card">
      <h2 className="card__title">Психологические портреты</h2>

      {/* Легенда маппинга имён */}
      {hasMapping && (
        <details style={{ marginBottom: '16px', cursor: 'pointer' }}>
          <summary style={{
            fontSize: '0.9rem',
            color: '#6366f1',
            fontWeight: 600,
            userSelect: 'none'
          }}>
            Показать, у кого какой псевдоним
          </summary>
          <ul style={{
            marginTop: '8px',
            paddingLeft: '20px',
            listStyle: 'none',
            fontSize: '0.9rem'
          }}>
            {Object.entries(nameMapping).map(([orig, alias]) => {
              const cls = PARTICIPANT_COLORS[alias] ?? 'user-chip-default';
              return (
                <li key={orig} style={{ marginBottom: '4px' }}>
                  <span className={cls}>{orig}</span>
                  {' → '}
                  <span className={cls}>{alias}</span>
                </li>
              );
            })}
          </ul>
        </details>
      )}
      <div className="participants-grid">
        {participants.map((p, idx) => (
          <div key={p.id} className="participant-card">
            <h3 className={`participant-card__name ${getChipClass(idx)}`}>{p.display_name}</h3>
            <p className="participant-card__summary">{highlightText(p.summary, PARTICIPANT_HIGHLIGHTS)}</p>
            {Object.keys(p.traits).length > 0 && (
              <ul className="traits-list">
                {Object.entries(p.traits).map(([trait, value]) => (
                  <li key={trait}>
                    <span className="traits-list__label">{trait}:</span>{" "}
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
