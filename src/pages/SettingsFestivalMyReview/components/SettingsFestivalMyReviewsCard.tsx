import { type MyReview } from '@/apis/review/getMyReviews';
import StarRating from '@/components/common/StarRating';
import PickIcon from '@/components/common/PickIcon';
import { PICK_ICONS } from '@/constants/pickIcons';

interface SettingsMyReviewsCardProps {
  review: MyReview;
  handleEditReview: (reviewId: number) => void;
  handleDeleteReview: (reviewId: number) => void;
  handleMediaClick: (review: MyReview, index: number) => void;
}
/**
 * 내가 작성한 리뷰 카드
 * @param review - 리뷰 정보
 * @param handleDeleteReview - 리뷰 삭제 핸들러
 * @param handleMediaClick - 미디어 클릭 핸들러
 * @returns 내가 작성한 리뷰 카드 컴포넌트
 * 내가 작성한 리뷰 정보를 표시합니다.
 */
const SettingsMyReviewsCard = ({
  review,
  handleEditReview,
  handleDeleteReview,
  handleMediaClick,
}: SettingsMyReviewsCardProps) => {
  return (
    <div key={review.reviewId} className="ui-panel">
      <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
        <h3 className="text-base font-bold text-ui-ink [overflow-wrap:anywhere]">
          {review.festivalTitle}
        </h3>
        <StarRating rating={review.score} showScore />
      </div>

      {review.imageUrls && review.imageUrls.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {review.imageUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => handleMediaClick(review, index)}
              className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-secondary-600"
              aria-label={`리뷰 이미지 ${index + 1} 크게 보기`}
            >
              <img
                src={url}
                alt={`리뷰 이미지 ${index + 1}`}
                className="w-16 h-16 object-cover rounded"
              />
            </button>
          ))}
        </div>
      )}
      {review.videoUrl && (
        <div className="mb-3">
          <video
            src={review.videoUrl}
            controls
            className="w-full max-w-xs rounded cursor-pointer"
            onClick={() => handleMediaClick(review, review.imageUrls?.length || 0)}
          />
        </div>
      )}
      <p className="ui-body text-ui-ink mb-3 whitespace-pre-wrap [overflow-wrap:anywhere]">
        {review.content}
      </p>
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="text-sm text-ui-muted [overflow-wrap:anywhere]">
          작성자: {review.reviewerName}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleEditReview(review.reviewId)}
            className="text-secondary-700 min-h-11 min-w-11 p-2 rounded-xl bg-secondary-50"
            aria-label="리뷰 수정"
          >
            <PickIcon name={PICK_ICONS.EDIT} size={24} />
          </button>
          <button
            onClick={() => handleDeleteReview(review.reviewId)}
            className="text-red-700 min-h-11 min-w-11 p-2 rounded-xl bg-red-50"
            aria-label="리뷰 삭제"
          >
            <PickIcon name={PICK_ICONS.DELETE} size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsMyReviewsCard;
