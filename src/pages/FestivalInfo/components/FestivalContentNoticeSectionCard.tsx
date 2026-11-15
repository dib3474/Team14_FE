import type { Notice } from '@/types/Notice';

interface FestivalContentNoticeSectionCardProps {
  notice: Notice;
  onClick?: (noticeId: number) => void;
  tabIndex?: number;
}

const FestivalContentNoticeSectionCard = ({
  notice,
  onClick,
  tabIndex = 0,
}: FestivalContentNoticeSectionCardProps) => {
  return (
    <button
      type="button"
      tabIndex={tabIndex}
      onClick={() => onClick?.(notice.id)}
      className="w-full h-full min-h-15 py-4 px-12 border border-ui-line rounded-xl flex items-center bg-ui-canvas hover:border-primary-300 transition-colors cursor-pointer"
    >
      <p className="font-medium text-ui-ink text-sm leading-relaxed w-full text-center break-words">
        {notice.title}
      </p>
    </button>
  );
};

export default FestivalContentNoticeSectionCard;
