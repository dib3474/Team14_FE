import { useId } from 'react';
import Button from '@/components/common/Button';
import {
  getFestivalFilterError,
  parseFestivalDate,
  type FestivalFilterValue,
} from '@/utils/festivalFilters';
import './festival-filters.css';

interface FestivalFiltersProps {
  value: FestivalFilterValue;
  onChange: (value: FestivalFilterValue) => void;
  onReset: () => void;
}

const FestivalFilters = ({ value, onChange, onReset }: FestivalFiltersProps) => {
  const id = useId();
  const error = getFestivalFilterError(value);
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  return (
    <section className="ui-panel festival-filters" aria-label="축제 조건 필터">
      <div className="festival-filters-heading">
        <h2 className="ui-section-title">언제 떠나세요?</h2>
        <Button variant="link" size="sm" onClick={onReset}>
          필터 초기화
        </Button>
      </div>
      <div className="festival-filter-dates">
        <label htmlFor={`${id}-start`} className="ui-body">
          시작일
          <input
            id={`${id}-start`}
            type="date"
            value={value.startDate}
            max={parseFestivalDate(value.endDate) !== null ? value.endDate : undefined}
            aria-invalid={!!error}
            aria-describedby={error ? `${descriptionId} ${errorId}` : descriptionId}
            onChange={(event) => onChange({ ...value, startDate: event.target.value })}
          />
        </label>
        <label htmlFor={`${id}-end`} className="ui-body">
          종료일
          <input
            id={`${id}-end`}
            type="date"
            value={value.endDate}
            min={parseFestivalDate(value.startDate) !== null ? value.startDate : undefined}
            aria-invalid={!!error}
            aria-describedby={error ? `${descriptionId} ${errorId}` : descriptionId}
            onChange={(event) => onChange({ ...value, endDate: event.target.value })}
          />
        </label>
      </div>
      <p id={descriptionId} className="ui-caption">
        선택한 기간과 하루라도 겹치는 축제를 찾아요. 날짜는 한쪽만 선택해도 돼요.
      </p>
      {error && (
        <p id={errorId} className="festival-filter-error ui-body" role="alert">
          {error} 날짜 조건을 적용하지 않은 결과를 보여드립니다.
        </p>
      )}
      <div className="festival-filter-current">
        <span className="ui-body">진행 중인 축제만</span>
        <button
          type="button"
          role="switch"
          aria-label="진행 중인 축제만 보기"
          aria-checked={value.currentOnly}
          className="festival-filter-switch"
          onClick={() => onChange({ ...value, currentOnly: !value.currentOnly })}
        >
          <span className="festival-filter-thumb" />
        </button>
      </div>
    </section>
  );
};
export default FestivalFilters;
