import type { FestivalPermissionDetail } from '@/apis/festivalManager/getMyFestivalPermissionDetail';

interface FestivalPermissionInfoCardProps {
  permission: FestivalPermissionDetail;
}
/**
 * 축제 관리자 신청 정보 카드
 * @param permission - 축제 관리자 신청 정보
 * @returns 축제 관리자 신청 정보 카드 컴포넌트
 * 축제 관리자 신청 정보를 표시합니다.
 */
const FestivalPermissionInfoCard = ({ permission }: FestivalPermissionInfoCardProps) => {
  return (
    <div className="ui-panel">
      <h3 className="ui-section-title mb-4">축제 정보</h3>

      <div className="space-y-3">
        <div>
          <img
            src={permission.posterImg}
            alt={permission.title}
            className="w-full max-h-80 object-contain rounded-xl bg-ui-canvas"
          />
        </div>

        <div>
          <p className="text-sm leading-relaxed text-ui-muted [overflow-wrap:anywhere]">축제명</p>
          <p className="font-medium text-lg [overflow-wrap:anywhere]">{permission.title}</p>
        </div>

        <div>
          <p className="text-sm leading-relaxed text-ui-muted [overflow-wrap:anywhere]">신청 ID</p>
          <p className="ui-body text-ui-ink [overflow-wrap:anywhere]">#{permission.id}</p>
        </div>

        <div>
          <p className="text-sm leading-relaxed text-ui-muted [overflow-wrap:anywhere]">신청일</p>
          <p className="ui-body text-ui-ink [overflow-wrap:anywhere]">
            {new Date(permission.appliedDate).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FestivalPermissionInfoCard;
