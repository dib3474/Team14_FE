import '../festivals.css';
import Heart from '@/components/icon/HeartIcon';
import StarIcon from '@/components/icon/StarIcon';
import { ROUTE_PATH } from '@/constants/routes';
import type { Festival } from '@/types/FestivalType';
import { generatePath, Link } from 'react-router-dom';

interface FestivalCardProps {
  data: Festival;
  highlight?: boolean;
}
/* 기존에는 서버에서 내려오는 축제의 종료일과 오늘 날짜를 비교하는 로직과의 차이에서
 * 서버에서 받은 날짜 문자열("YYYY-MM-DD")은 Date 객체 생성 시 KST 09:00:00으로 해석되는데 그대로 뺄셈을 진행해서 오류가 발생했었습니다.
 * 이를 해결하기 위해 종료일을 Date 객체로 생성 시 23:59:59로 초기화하여 하루 종일 "진행 중"으로 표시하도록 하였습니다.
 */
const isInProgress = (endDateData: string): boolean => {
  const [year, month, day] = endDateData.split('-').map(Number);
  const endDate = new Date(year, month - 1, day, 23, 59, 59);
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  return diffTime >= 0;
};

const FestivalCard = ({ data, highlight = false }: FestivalCardProps) => {
  const isInProgressFestival = isInProgress(data.endDate);
  return (
    <Link
      className={`festival-card ${highlight ? 'festival-card-highlight' : ''}`}
      to={generatePath(ROUTE_PATH.FESTIVAL_INFO, { festivalId: data.id.toString() })}
    >
      <div className="festival-card-poster">
        <img src={data.posterInfo} alt={`${data.title} 축제 이미지`} loading="lazy" />
        <div className="festival-card-badges">
          {highlight && <span className="festival-ai-label">AI PICK</span>}
          {isInProgressFestival && <span className="festival-current-label">진행 중</span>}
        </div>
      </div>
      <div className="festival-card-content">
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
