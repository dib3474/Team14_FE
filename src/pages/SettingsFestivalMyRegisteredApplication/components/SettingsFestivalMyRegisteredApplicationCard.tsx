import { statusTone } from '@/pages/Settings/statusTone';
import useNav from '@/hooks/useNav';
import { generatePath } from 'react-router-dom';
import { ROUTE_PATH } from '@/constants/routes';
import type { FestivalRegistrationApplication } from '@/types/FestivalFormTypes';
import { getFestivalPermissionStatusInfo } from '@/utils/festivalPermissionStatus';
import PickIcon from '@/components/common/PickIcon';

interface SettingsFestivalMyRegisteredApplicationCardProps {
  application: FestivalRegistrationApplication;
}

const SettingsFestivalMyRegisteredApplicationCard = ({
  application,
}: SettingsFestivalMyRegisteredApplicationCardProps) => {
  const { goTo } = useNav();
  const statusInfo = getFestivalPermissionStatusInfo(application.state);

  const handleClick = () => {
    goTo(
      generatePath(ROUTE_PATH.FESTIVAL_INFO, {
        festivalId: application.id.toString(),
      }),
    );
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
            <span className="block text-base font-bold leading-snug text-ui-ink">
              {application.title}
            </span>
            <span className={`ui-tag shrink-0 border ${statusTone(application.state)}`}>
              <PickIcon name={statusInfo.icon} size={16} className="mr-1" />
              {statusInfo.label}
            </span>
          </span>
          <span className="text-sm leading-relaxed text-ui-muted [overflow-wrap:anywhere]">
            최종 수정일: {new Date(application.updatedDate).toLocaleDateString('ko-KR')}
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

export default SettingsFestivalMyRegisteredApplicationCard;
