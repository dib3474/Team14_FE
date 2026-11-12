import EmptyComponent from '@/components/common/EmptyComponent';
import FestivalCard from '@/pages/Festivals/components/FestivalCard';
import type { Festival } from '@/types/FestivalType';
import type { ReactNode } from 'react';

interface FestivalsSectionProps {
  title: string;
  data: Festival[];
  highlight?: boolean;
  rightAction?: ReactNode;
}

const FestivalsSection = ({
  title,
  data,
  highlight = false,
  rightAction,
}: FestivalsSectionProps) => {
  return (
    <section className="w-full">
      <div className="festival-section-heading">
        <h2 className="ui-section-title">{title}</h2>
        {rightAction}
      </div>
      {data.length === 0 ? (
        <div className="festival-empty">
          <img src="/lost404.svg" alt="no festivals" className="object-contain" />
          <EmptyComponent
            title="진행 중인 축제가 없습니다."
            description="진행 중 체크를 해제하거나 다른 지역의 축제를 찾아보세요!"
          />
        </div>
      ) : (
        <div className="grid festival-grid">
          {data.map((festival) => (
            <FestivalCard key={festival.id} data={festival} highlight={highlight} />
          ))}
        </div>
      )}
    </section>
  );
};

export default FestivalsSection;
