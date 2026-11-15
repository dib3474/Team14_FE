import type { FestivalInfo } from '@/types/FestivalType';
import Button from '@/components/common/Button';

interface FestivalInfoNoticeListInfoCardProps {
  festivalData: FestivalInfo;
  title?: string;
  showCreateButton?: boolean;
  onCreateNotice?: () => void;
  onClick?: () => void;
}

const FestivalInfoNoticeListInfoCard = ({
  festivalData,
  title,
  showCreateButton = false,
  onCreateNotice,
  onClick,
}: FestivalInfoNoticeListInfoCardProps) => {
  const body = (
    <>
      {festivalData?.posterInfo && (
        <img
          src={festivalData.posterInfo}
          alt=""
          className="w-20 h-20 shrink-0 object-cover rounded-xl"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ui-ink break-words">{festivalData?.title}</p>
        <p className="ui-caption mt-1">{festivalData?.addr1}</p>
        <p className="ui-caption mt-1">
          {festivalData?.startDate} ~ {festivalData?.endDate}
        </p>
      </div>
    </>
  );
  return (
    <div className="ui-inset mb-6">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <h2 className="ui-section-title">{title || '공지사항을 작성할 축제'}</h2>
        {showCreateButton && onCreateNotice && (
          <Button
            variant="text"
            onClick={(e) => {
              e.stopPropagation();
              onCreateNotice();
            }}
            className="text-sm text-ui-action"
          >
            공지사항 작성
          </Button>
        )}
      </div>
      {onClick ? (
        <button type="button" className="flex w-full gap-3 text-left" onClick={onClick}>
          {body}
          <span className="sr-only">축제 정보 보기</span>
        </button>
      ) : (
        <div className="flex gap-3">{body}</div>
      )}
    </div>
  );
};
export default FestivalInfoNoticeListInfoCard;
