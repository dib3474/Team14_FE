import PickSubTitle from '@/pages/Pick/components/PickSubTitle';
import PickMBTIList from '@/pages/Pick/components/PickMBTIList';
import OutlineInputField from '@/components/form/OutlineInputField';
import Button from '@/components/common/Button';
import { usePick } from '@/context/PickContext';

const PickMBTISection = () => {
  const {
    additionalInfo,
    handleAdditionalInfo,
    onSubmitRecommendation,
    canProceedToRecommendation,
  } = usePick();

  return (
    <section className="ui-page pick-page">
      <div className="flex flex-col gap-3">
        <PickSubTitle />
        <h1 className="ui-title">
          당신의 <span>여행 MBTI</span>를 선택해 주세요.
        </h1>
        <p className="ui-body text-ui-muted">평소 여행하는 모습에 가까운 답을 골라주세요.</p>
      </div>
      <PickMBTIList />
      <div className="ui-panel flex flex-col gap-4">
        <h2 className="ui-section-title">나를 더 알려주고 싶어요.</h2>
        <label htmlFor="pick-additional-info" className="ui-body font-bold">
          추가 정보 (선택)
        </label>
        <OutlineInputField
          id="pick-additional-info"
          placeholder="캠핑, 불멍, 서핑"
          rounded="xl"
          value={additionalInfo}
          onChange={handleAdditionalInfo}
        />
        <p className="ui-caption">관심 있는 활동이나 여행 취향을 자유롭게 적어주세요.</p>
      </div>
      <Button
        fullWidth
        disabled={!canProceedToRecommendation}
        onClick={() => onSubmitRecommendation()}
      >
        추천 받기
      </Button>
    </section>
  );
};

export default PickMBTISection;
