import type { FMPermissionStatusResponse } from '@/apis/festivalManager/getMyFMPermission';

interface SettingsFMPermissionInfoCardProps {
  permission: FMPermissionStatusResponse['content'];
}

/**
 * 축제 관리자 신청 정보 카드
 * @param permission - 축제 관리자 신청 상태
 * @returns 축제 관리자 신청 정보 카드 컴포넌트
 * 축제 관리자 신청 정보를 표시합니다.
 */
const SettingsFMPermissionInfoCard = ({ permission }: SettingsFMPermissionInfoCardProps) => {
  return (
    <div className="ui-panel">
      <h3 className="ui-section-title mb-4">신청 정보</h3>

      <div className="space-y-3">
        <div>
          <p className="text-sm leading-relaxed text-ui-muted [overflow-wrap:anywhere]">소속</p>
          <p className="ui-body font-medium [overflow-wrap:anywhere]">{permission.department}</p>
        </div>

        <div>
          <p className="text-sm leading-relaxed text-ui-muted [overflow-wrap:anywhere]">신청 ID</p>
          <p className="ui-body text-ui-ink [overflow-wrap:anywhere]">#{permission.id}</p>
        </div>

        <div>
          <p className="text-sm leading-relaxed text-ui-muted [overflow-wrap:anywhere]">
            최종 수정일
          </p>
          <p className="ui-body text-ui-ink [overflow-wrap:anywhere]">
            {new Date(permission.updatedDate).toLocaleDateString('ko-KR', {
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
export default SettingsFMPermissionInfoCard;
