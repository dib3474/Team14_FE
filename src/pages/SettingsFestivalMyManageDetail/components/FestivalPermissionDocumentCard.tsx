import PickIcon from '@/components/common/PickIcon';
import { PICK_ICONS } from '@/constants/pickIcons';

interface FestivalPermissionDocumentCardProps {
  docs: string[];
}
/**
 * 축제 관리자 신청 서류 카드
 * @param docs - 서류 목록
 * @returns 축제 관리자 신청 서류 카드 컴포넌트
 * 축제 관리자 신청 서류를 표시합니다.
 */
const FestivalPermissionDocumentCard = ({ docs }: FestivalPermissionDocumentCardProps) => {
  return (
    <div className="ui-panel">
      <h3 className="ui-section-title mb-4">제출한 증빙 서류</h3>
      <div className="space-y-3">
        {docs.map((doc, index) => (
          <a
            key={index}
            href={doc}
            target="_blank"
            rel="noopener noreferrer"
            className="ui-inset flex items-center justify-between gap-3 border border-ui-line hover:bg-secondary-50 transition-colors"
          >
            <div className="flex min-w-0 items-center gap-2">
              <PickIcon name={PICK_ICONS.CLIP} size={24} />
              <span className="text-sm text-ui-ink">서류 {index + 1}</span>
            </div>
            <span className="text-sm text-secondary-700">보기 →</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default FestivalPermissionDocumentCard;
