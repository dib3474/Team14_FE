import { useSearchParams } from 'react-router-dom';

const PickSubTitle = () => {
  const [searchParams] = useSearchParams();
  const isMbtiStep = searchParams.get('step') === 'mbti';

  return (
    <div className="pick-progress">
      <p className="ui-eyebrow">당신에 대해 알려주세요!</p>
      <div
        className="pick-progress-track"
        aria-label={`추천 준비 ${isMbtiStep ? '2' : '1'}단계 / 2단계`}
      >
        <span className="pick-progress-dot is-current" aria-hidden="true" />
        <span
          className={`pick-progress-dot ${isMbtiStep ? 'is-current' : ''}`}
          aria-hidden="true"
        />
        <span className="ui-caption">{isMbtiStep ? '2 / 2' : '1 / 2'}</span>
      </div>
    </div>
  );
};

export default PickSubTitle;
