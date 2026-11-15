import { ROUTE_PATH } from '@/constants/routes';
import type { Festival } from '@/types/FestivalType';
import { generatePath, Link } from 'react-router-dom';
import StarRating from '@/components/common/StarRating';

interface AiRecommendationFestivalCardProps {
  data: Festival;
  rank?: number;
  reviewCount?: number;
}

const AiRecommendationFestivalCard = ({
  data,
  rank,
  reviewCount,
}: AiRecommendationFestivalCardProps) => {
  return (
    <Link
      className="ui-panel ai-result-card"
      to={generatePath(ROUTE_PATH.FESTIVAL_INFO, { festivalId: data.id.toString() })}
    >
      <div className="ai-result-heading">
        <span className="ai-pick-badge">AI PICK</span>
        {rank && (
          <span className="ui-caption font-bold">
            추천 {rank} · #{rank}
          </span>
        )}
      </div>
      <div className="ai-result-poster">
        <img src={data.posterInfo} alt={`${data.title} 축제 이미지`} />
      </div>
      <div className="ai-result-details">
        <h3 className="ui-section-title">{data.title}</h3>
        <div className="ai-result-rating ui-caption">
          {data.averageScore !== null ? (
            <StarRating rating={data.averageScore} showScore size="sm" />
          ) : (
            <span>아직 평점이 없어요</span>
          )}
          {!!reviewCount && <span>리뷰 {reviewCount}건</span>}
        </div>
        <dl className="ai-result-metadata ui-body">
          <div>
            <dt className="ui-caption">기간</dt>
            <dd>
              {data.startDate} ~ {data.endDate}
            </dd>
          </div>
          <div>
            <dt className="ui-caption">장소</dt>
            <dd>{data.addr1}</dd>
            {data.addr2 && <dd>{data.addr2}</dd>}
          </div>
        </dl>
        <span className="ai-result-action">
          축제 자세히 보기 <span aria-hidden="true">↗</span>
        </span>
      </div>
    </Link>
  );
};

export default AiRecommendationFestivalCard;
