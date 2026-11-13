import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { getMyChats } from '@/apis/chat/getMyChats';
import EmptyComponent from '@/components/common/EmptyComponent';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { generatePath, Link } from 'react-router-dom';
import { ROUTE_PATH } from '@/constants/routes';
import useChatRead from '@/hooks/useChatRead';

const MyPageChatSection = () => {
  useChatRead();

  const { data, isFetching, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery({
    queryKey: ['myChats'],
    queryFn: ({ pageParam = 0 }) => getMyChats(pageParam, 5),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.data.last ? undefined : allPages.length;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 1,
    gcTime: 0,
  });

  const { ref: observerRef } = useIntersectionObserver(() => {
    if (isFetching || !hasNextPage) return;
    fetchNextPage();
  });

  const myChats = data?.pages.flatMap((page) => page.data.content) || [];

  // 예전 채팅 목록처럼 시각적 이름은 줄이고 링크에는 전체 이름을 제공합니다.
  const formatRoomName = (roomName: string) => {
    const cleanedName = roomName.replace(/\s*채팅방\s*/g, '');
    return cleanedName.length > 8 ? `${cleanedName.substring(0, 5)}...` : cleanedName;
  };

  if (data && myChats.length === 0 && !isFetching) {
    return (
      <EmptyComponent
        title="채팅 목록이 없습니다."
        description="대화를 시작해보세요!"
        className="ui-panel min-h-32"
      />
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="ui-section-title">참여 중인 채팅방</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
        {myChats.map((chat) => (
          <Link
            to={generatePath(ROUTE_PATH.CHAT, { festivalId: chat.festivalId.toString() })}
            key={chat.roomId}
            aria-label={chat.roomName}
            title={chat.roomName}
            className="flex-shrink-0 flex flex-col items-center gap-2 w-20 snap-start rounded-xl focus-visible:outline-2 focus-visible:outline-secondary-600"
          >
            <div className="relative">
              <img
                src={chat.posterInfo}
                alt={chat.roomName}
                className="size-20 rounded-full object-cover border-2 border-gray-200"
              />
              {chat.existNewMessage && (
                <div
                  role="img"
                  aria-label="새 메시지 있음"
                  className="absolute bottom-0 right-0 w-5 h-5 bg-green-600 rounded-full border-2 border-white"
                />
              )}
            </div>
            <div className="flex flex-col items-center text-center">
              <h3 className="text-sm font-medium text-ui-ink line-clamp-2">
                {formatRoomName(chat.roomName)}
              </h3>
            </div>
          </Link>
        ))}
        {isFetching && (
          <div
            className={`flex-shrink-0 flex flex-col items-center justify-center${!data ? 'w-full h-[156px]' : ''}`}
          >
            <LoadingSpinner />
          </div>
        )}
        {!isFetching && hasNextPage && (
          <div ref={observerRef} className="flex-shrink-0 min-w-12 h-1" />
        )}
      </div>
    </section>
  );
};

export default MyPageChatSection;
