import BorderCardComponent from '@/components/common/BorderCardComponent';
import type { FestivalCardProps } from '@/types/FestivalFormTypes';

/**
 * 축제 등록,수정 폼 기간 카드
 * @param formData - 폼 데이터
 * @param handleInputChange - 입력 변경 핸들러
 * @param isSubmitting - 제출 중 여부
 * @returns 축제 등록,수정 폼 기간 카드 컴포넌트
 * 축제 등록,수정 폼 기간을 표시합니다.
 */
const FestivalFormPeriodCard = ({
  formData,
  handleInputChange,
  isSubmitting,
}: FestivalCardProps) => {
  return (
    <BorderCardComponent>
      <div className="flex flex-col gap-2">
        <label className="font-semibold">
          축제 기간 <span className="text-red-700">*</span>
        </label>
        <div className="ui-period-grid">
          <div className="ui-field">
            <label htmlFor="startDate" className="ui-caption">
              시작일
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
              className="ui-control"
              disabled={isSubmitting}
            />
          </div>
          <div className="ui-field">
            <label htmlFor="endDate" className="ui-caption">
              종료일
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
              className="ui-control"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
    </BorderCardComponent>
  );
};

export default FestivalFormPeriodCard;
