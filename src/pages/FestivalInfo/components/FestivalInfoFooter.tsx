import getFestivalInfo from '@/apis/festivals/getFestivalInfo';
import { generatePath, Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ROUTE_PATH } from '@/constants/routes';

const FestivalInfoFooter = () => {
  const containerClasses = 'festival-info-footer';
  const baseClasses = 'festival-info-footer-inner';
  const buttonClasses = 'festival-footer-action';
  const { festivalId } = useParams();
  const { data: festivalData } = useQuery({
    queryKey: ['festival', festivalId],
    queryFn: () => getFestivalInfo({ festivalId: festivalId || '' }),
    select: (data) => data.data,
    enabled: !!festivalId,
  });
  return (
    <div className={containerClasses}>
      <div className={baseClasses}>
        <Link
          to={generatePath(ROUTE_PATH.REVIEW, { festivalId: festivalId || '' })}
          state={{ festivalInfo: festivalData?.content }}
          className={`${buttonClasses} festival-footer-secondary`}
        >
          리뷰하기
        </Link>
        <Link
          to={generatePath(ROUTE_PATH.CHAT, { festivalId: festivalId || '' })}
          className={`${buttonClasses} festival-footer-primary`}
        >
          채팅 참여하기
        </Link>
      </div>
    </div>
  );
};

export default FestivalInfoFooter;
