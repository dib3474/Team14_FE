import PickIcon from '@/components/common/PickIcon';
import { PICK_ICONS } from '@/constants/pickIcons';
import MAP_PINS from '@/constants/mapPins';
import PICK_STYLES from '@/constants/pickStyles';
import AiRecommendationIconInfoCard from '@/pages/AiRecommendationHistories/components/AiRecommendationIconInfoCard';
import type { RecommendationFormResponse } from '@/types/AiRecommendationTypes';

interface AiRecommendationSummaryCardProps {
  formData: RecommendationFormResponse;
}

const AiRecommendationSummaryCard = ({ formData }: AiRecommendationSummaryCardProps) => {
  const getAreaIcon = (areaCode: number) => {
    const area = MAP_PINS.find((pin) => pin.areaId === String(areaCode));
    return area?.icon;
  };

  const getAreaName = (areaCode: number) => {
    const area = MAP_PINS.find((pin) => pin.areaId === String(areaCode));
    return area?.name || String(areaCode);
  };

  const getStyleIcon = (styleId: string) => {
    const style = PICK_STYLES.find((s) => s.id === styleId);
    return style?.image;
  };

  const getStyleName = (styleId: string) => {
    const style = PICK_STYLES.find((s) => s.id === styleId);
    return style?.name || styleId;
  };

  return (
    <section className="ui-panel ai-choice-summary" aria-labelledby="ai-choice-title">
      <div>
        <p className="ui-eyebrow">MY FESTIVAL TASTE</p>
        <h2 id="ai-choice-title" className="ui-section-title flex items-center gap-2 mt-2">
          <PickIcon name={PICK_ICONS.PIN} className="w-6 h-6 shrink-0" />
          당신의 선택
        </h2>
      </div>
      <div className="ai-choice-grid">
        <AiRecommendationIconInfoCard
          label="지역"
          icon={getAreaIcon(formData.areaCode)}
          iconAlt={getAreaName(formData.areaCode)}
          value={getAreaName(formData.areaCode)}
        />
        {formData.styles?.slice(0, 3).map((styleId) => (
          <AiRecommendationIconInfoCard
            key={styleId}
            label="스타일"
            icon={getStyleIcon(styleId)}
            iconAlt={getStyleName(styleId)}
            value={getStyleName(styleId)}
          />
        ))}
      </div>
      <div>
        <h3 className="ui-body font-bold mb-3">당신의 여행 MBTI</h3>
        <div className="flex flex-wrap gap-2">
          <span className="ui-tag ai-choice-tag">
            {formData.isNewPlace ? '새로운 장소' : '익숙한 장소'}
          </span>
          <span className="ui-tag ai-choice-tag">{formData.isSolo ? '혼자' : '함께'}</span>
          <span className="ui-tag ai-choice-tag">
            {formData.prefersEnjoyment ? '즐거움 선호' : '유익함을'}
          </span>
          <span className="ui-tag ai-choice-tag">
            {formData.isSpontaneous ? '즉흥적' : '계획적으로'}
          </span>
        </div>
      </div>
      {formData.additionalInfo && (
        <div className="ui-inset">
          <h3 className="ui-caption font-bold">추가 정보</h3>
          <p className="ui-body mt-1 whitespace-pre-wrap break-words">{formData.additionalInfo}</p>
        </div>
      )}
    </section>
  );
};

export default AiRecommendationSummaryCard;
