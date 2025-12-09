import type { RelationshipSummary } from "../../types/api";
import { highlightText, type HighlightConfig } from "../../utils/textHighlight";
import { PARTICIPANT_COLORS } from "../../constants";

const PARTICIPANT_HIGHLIGHTS: HighlightConfig[] = Object.entries(
  PARTICIPANT_COLORS,
).map(([id, className]) => ({
  label: id,
  className,
}));

interface RelationshipCardProps {
  relationship: RelationshipSummary;
}

export const RelationshipCard = ({ relationship }: RelationshipCardProps) => {
  if (!relationship.description && !relationship.red_flags.length && !relationship.green_flags.length) {
    return null;
  }

  return (
    <section className="card">
      <h2 className="card__title">Динамика отношений</h2>
      {relationship.description && (
        <p className="card__text">{highlightText(relationship.description, PARTICIPANT_HIGHLIGHTS)}</p>
      )}

      {relationship.red_flags.length > 0 && (
        <>
          <h3 className="pill pill--red">Возможные red flags</h3>
          <ul className="list">
            {relationship.red_flags.map((rf, idx) => (
              <li key={idx}>{highlightText(rf, PARTICIPANT_HIGHLIGHTS)}</li>
            ))}
          </ul>
        </>
      )}

      {relationship.green_flags.length > 0 && (
        <>
          <h3 className="pill pill--green">Плюсы и опоры</h3>
          <ul className="list">
            {relationship.green_flags.map((gf, idx) => (
              <li key={idx}>{highlightText(gf, PARTICIPANT_HIGHLIGHTS)}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
