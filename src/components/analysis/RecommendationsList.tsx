import type { Recommendation } from "../../types/api";
import { highlightText, type HighlightConfig } from "../../utils/textHighlight";
import { PARTICIPANT_COLORS } from "../../constants";

const PARTICIPANT_HIGHLIGHTS: HighlightConfig[] = Object.entries(
  PARTICIPANT_COLORS,
).map(([id, className]) => ({
  label: id,
  className,
}));

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export const RecommendationsList = ({
   recommendations,
  }: RecommendationsListProps) => {
  if (!recommendations.length) return null;

  return (
    <section className="card">
      <h2 className="card__title">Рекомендации</h2>
      <div className="recommendations-list">
        {recommendations.map((r, idx) => (
          <div key={idx} className="recommendation-item">
            <h3 className="recommendation-item__title">{highlightText(r.title, PARTICIPANT_HIGHLIGHTS)}</h3>
            <p className="recommendation-item__text">{highlightText(r.text, PARTICIPANT_HIGHLIGHTS)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
