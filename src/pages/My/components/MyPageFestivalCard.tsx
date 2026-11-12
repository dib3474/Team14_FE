import { ROUTE_PATH } from '@/constants/routes';
import type { Festival } from '@/types/FestivalType';
import { generatePath, Link } from 'react-router-dom';

interface MyPageFestivalCardProps {
  data: Festival;
}

const MyPageFestivalCard = ({ data }: MyPageFestivalCardProps) => {
  return (
    <Link
      className="bg-ui-surface rounded-[20px] overflow-hidden border border-ui-line hover:border-secondary-300 transition-colors cursor-pointer flex items-stretch min-h-36 focus-visible:outline-2 focus-visible:outline-secondary-600"
      to={generatePath(ROUTE_PATH.FESTIVAL_INFO, { festivalId: data.id.toString() })}
    >
      {/* 이미지 섹션 */}
      <div className="relative w-24 overflow-hidden shrink-0">
        <img
          src={data.posterInfo}
          alt={`${data.title} 축제 이미지`}
          className="h-full w-full object-cover"
        />
      </div>

      {/* 콘텐츠 섹션 */}
      <div className="flex-1 min-w-0 p-4 flex flex-col justify-center gap-3">
        <h3 className="text-base font-bold leading-snug text-ui-ink break-words">{data.title}</h3>

        <div className="space-y-1">
          <p className="text-xs leading-relaxed text-ui-muted font-medium break-words">
            {data.startDate} ~ {data.endDate}
          </p>
          <p className="text-xs leading-relaxed text-ui-muted break-words" title={data.addr1}>
            {data.addr1.split(' ').slice(0, 2).join(' ')}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default MyPageFestivalCard;
