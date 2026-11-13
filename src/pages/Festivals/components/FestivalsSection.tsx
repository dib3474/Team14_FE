import EmptyComponent from '@/components/common/EmptyComponent';
import FestivalCard from '@/pages/Festivals/components/FestivalCard';
import type { Festival } from '@/types/FestivalType';
import type { ReactNode } from 'react';

interface FestivalsSectionProps {
  title: string;
  data: Festival[];
  highlight?: boolean;
  rightAction?: ReactNode;
  showEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

const FestivalsSection = ({
  title,
  data,
  highlight = false,
  rightAction,
  showEmpty = true,
  emptyTitle = '진행 중인 축제가 없습니다.',
  emptyDescription = '진행 중 체크를 해제하거나 다른 지역의 축제를 찾아보세요!',
}: FestivalsSectionProps) => {
  return (
    <section className="w-full">
      <div className="festival-section-heading">
        <h2 className="ui-section-title">{title}</h2>
        {rightAction}
      </div>
      {data.length === 0 ? (
        showEmpty ? (
          <div className="festival-empty">
            <img src="/lost404.svg" alt="no festivals" className="object-contain" />
            <EmptyComponent title={emptyTitle} description={emptyDescription} />
          </div>
        ) : null
      ) : (
        <div className="grid festival-list">
          {data.map((festival, index) => (
            <FestivalCard
              key={festival.id}
              data={festival}
              highlight={highlight}
              variant="row"
              priority={index === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default FestivalsSection;
