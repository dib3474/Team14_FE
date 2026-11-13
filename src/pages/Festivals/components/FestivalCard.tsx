import '../festivals.css';
import Heart from '@/components/icon/HeartIcon';
import StarIcon from '@/components/icon/StarIcon';
import { ROUTE_PATH } from '@/constants/routes';
import type { Festival } from '@/types/FestivalType';
import { generatePath, Link } from 'react-router-dom';
import { getListFestivalStatus } from '@/pages/Festivals/festivalStatus';

interface FestivalCardProps {
  data: Festival;
  highlight?: boolean;
  variant?: 'poster' | 'row';
  priority?: boolean;
}
const labels = { upcoming: '예정', ongoing: '진행 중', ended: '종료', unknown: '일정 확인' };

const FestivalCard = ({
  data,
  highlight = false,
  variant = 'poster',
  priority = false,
}: FestivalCardProps) => {
  const status = getListFestivalStatus(data.startDate, data.endDate);
  const badges = (
    <>
      {highlight && <span className="festival-ai-label">AI PICK</span>}
      <span className={`festival-status ${status}`}>{labels[status]}</span>
    </>
  );
  return (
    <Link
      className={`festival-card festival-card-${variant}-view ${highlight ? 'festival-card-highlight' : ''}`}
      to={generatePath(ROUTE_PATH.FESTIVAL_INFO, { festivalId: data.id.toString() })}
    >
      <div className={`festival-card-poster ${status === 'ended' ? 'ended' : ''}`}>
        {data.posterInfo ? (
          <img
            src={data.posterInfo}
            alt={variant === 'row' ? '' : `${data.title} 축제 이미지`}
            loading={priority ? 'eager' : 'lazy'}
          />
        ) : (
          <span className="ui-caption p-2 text-center">이미지 준비 중</span>
        )}
        {variant === 'poster' && <div className="festival-card-badges">{badges}</div>}
      </div>
      <div className="festival-card-content">
        {variant === 'row' && <div className="festival-row-badges">{badges}</div>}
        <h3>{data.title}</h3>
        <p className="festival-card-date">
          {data.startDate} ~ {data.endDate}
        </p>
        <p className="festival-card-address">{data.addr1}</p>
        <div className="festival-card-meta">
          <span>
            <StarIcon
              filled
              className={`${data.averageScore !== null ? 'text-yellow-500' : 'text-gray-400'} size-4`}
            />
            <span>평점 {data.averageScore?.toFixed(1) ?? '-'}</span>
          </span>
          <span>
            <Heart fill className="size-4" />
            <span>관심 {data.wishCount}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};
export default FestivalCard;
