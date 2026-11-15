import PickSubTitle from '@/pages/Pick/components/PickSubTitle';
import PickStyleList from '@/pages/Pick/components/PickStyleList';
import Button from '@/components/common/Button';
import { usePick } from '@/context/PickContext';

const PickStyleSection = () => {
  const { goToNextStep, canProceedToMbti, selectedStyles } = usePick();

  return (
    <section className="ui-page pick-page">
      <div className="flex flex-col gap-3">
        <PickSubTitle />
        <h1 className="ui-title">
          즐기고 싶은 <span>축제의 스타일</span>을 선택해 주세요.
        </h1>
        <p className="ui-body text-ui-muted">마음이 가는 스타일을 최대 3개 골라주세요.</p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="pick-selection-summary">
          <h2 className="ui-section-title">어떤 축제가 끌리나요?</h2>
          <p className="ui-tag shrink-0" role="status" aria-live="polite">
            {selectedStyles.length} / 3 선택
          </p>
        </div>
        <PickStyleList />
      </div>
      <Button fullWidth onClick={() => goToNextStep()} disabled={!canProceedToMbti}>
        다음
      </Button>
    </section>
  );
};

export default PickStyleSection;
