import { useId } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { generatePath, Link } from 'react-router-dom';
import { getMyReviews } from '@/apis/review/getMyReviews';
import Button from '@/components/common/Button';
import EmptyComponent from '@/components/common/EmptyComponent';
import StarRating from '@/components/common/StarRating';
import ErrorComponent from '@/components/error/ErrorComponent';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { ROUTE_PATH } from '@/constants/routes';

const MyPageOwnReviewPreviews = () => {
  const headingId = useId();
  const {
    data,
    isPending,
    isError,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['myReviews', 'preview', 5],
    staleTime: 0,
    queryFn: ({ pageParam = 0 }) => getMyReviews(pageParam, 5),
    getNextPageParam: (lastPage, allPages) => (lastPage.data.last ? undefined : allPages.length),
    initialPageParam: 0,
    throwOnError: false,
  });
  const reviews = data?.pages.flatMap((page) => page.data.content) || [];

  return (
    <section aria-labelledby={headingId} className="flex min-w-0 flex-col gap-4">
      <div>
        <h2 id={headingId} className="ui-section-title">
          내가 작성한 리뷰
        </h2>
        <p className="ui-caption mt-1">내 평점과 축제에서의 기억을 다시 살펴보세요.</p>
      </div>
      {isPending ? (
        <LoadingSpinner message="내 리뷰를 불러오는 중..." className="ui-panel min-h-32" />
      ) : isError && reviews.length === 0 ? (
        <ErrorComponent
          title="내 리뷰를 불러올 수 없습니다"
          message="잠시 후 다시 시도해주세요."
          showBackButton={false}
          onRetry={() => {
            void refetch();
          }}
          className="ui-panel"
        />
      ) : reviews.length === 0 ? (
        <EmptyComponent
          title="작성한 리뷰가 없습니다."
          description="축제에서의 첫 기억을 남겨보세요."
          className="ui-panel"
        />
      ) : (
        <>
          {reviews.map((review) => (
            <article key={review.reviewId} className="ui-panel flex flex-col gap-3">
              <h3 className="text-base font-bold leading-snug text-ui-ink [overflow-wrap:anywhere]">
                {review.festivalTitle}
              </h3>
              {Number.isFinite(review.score) && (
                <div
                  role="img"
                  aria-label={`내 평점 ${review.score}점`}
                  className="flex flex-wrap items-center gap-2"
                >
                  <div aria-hidden="true">
                    <StarRating rating={review.score} size="sm" />
                  </div>
                  <span aria-hidden="true" className="text-sm font-semibold text-ui-ink">
                    내 평점 {review.score.toFixed(1)}점
                  </span>
                </div>
              )}
              {review.content && (
                <p className="ui-body line-clamp-3 whitespace-pre-wrap [overflow-wrap:anywhere]">
                  {review.content}
                </p>
              )}
              <Link
                to={generatePath(ROUTE_PATH.REVIEW_EDIT, { reviewId: review.reviewId.toString() })}
                aria-label={`${review.festivalTitle} 리뷰 수정`}
                className="inline-flex min-h-11 self-start items-center rounded-xl bg-secondary-50 px-3 text-sm font-semibold text-secondary-700 focus-visible:outline-2 focus-visible:outline-secondary-600"
              >
                리뷰 수정
              </Link>
            </article>
          ))}
          {isError && (
            <div className="ui-inset" role="alert">
              <p className="ui-body">리뷰를 더 불러오지 못했습니다. 다시 시도해주세요.</p>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => {
                  void (isFetchNextPageError ? fetchNextPage() : refetch());
                }}
                disabled={isFetching}
              >
                다시 시도
              </Button>
            </div>
          )}
          {hasNextPage && !isError && (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                void fetchNextPage();
              }}
              disabled={isFetching}
            >
              {isFetchingNextPage ? '리뷰를 불러오는 중...' : '리뷰 더 보기'}
            </Button>
          )}
        </>
      )}
    </section>
  );
};

export default MyPageOwnReviewPreviews;
