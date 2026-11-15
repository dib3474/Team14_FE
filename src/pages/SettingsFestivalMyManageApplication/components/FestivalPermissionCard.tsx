import { statusTone } from '@/pages/Settings/statusTone';
import { useNavigate } from 'react-router-dom';
import type { FestivalPermissionItem } from '@/apis/festivalManager/getMyFestivalPermissions';
import { getFestivalPermissionStatusInfo } from '@/utils/festivalPermissionStatus';
import PickIcon from '@/components/common/PickIcon';

interface FestivalPermissionCardProps {
  permission: FestivalPermissionItem;
}
/**
 * 축제 관리자 신청 카드
 * @param permission - 축제 관리자 신청 정보
 * @returns 축제 관리자 신청 카드 컴포넌트
 * 축제 관리자 신청 정보를 표시합니다.
 */
const FestivalPermissionCard = ({ permission }: FestivalPermissionCardProps) => {
  const navigate = useNavigate();
  const statusInfo = getFestivalPermissionStatusInfo(permission.state);

  const handleClick = () => {
    navigate(`/settings/festival-my-manage/${permission.id}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="ui-panel w-full text-left hover:border-secondary-300 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-secondary-600"
    >
      <span className="flex items-center justify-between gap-3">
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-start gap-2 mb-3">
            <span className="block text-base font-bold leading-snug text-ui-ink [overflow-wrap:anywhere]">
              {permission.title}
            </span>
            <span className={`ui-tag shrink-0 border ${statusTone(permission.state)}`}>
              <PickIcon name={statusInfo.icon} size={16} className="mr-1" />
              {statusInfo.label}
            </span>
          </span>
          <span className="block text-sm text-ui-muted [overflow-wrap:anywhere]">
            신청일: {new Date(permission.appliedDate).toLocaleDateString()}
          </span>
        </span>
        <span className="text-ui-muted shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </span>
    </button>
  );
};

export default FestivalPermissionCard;
