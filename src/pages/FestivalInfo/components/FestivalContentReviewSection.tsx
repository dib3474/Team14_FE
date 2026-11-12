import StarRating from '@/components/common/StarRating';
import type { Review } from '@/apis/review/getReview';
import FestivalContentReviewMediaSlider from '@/pages/FestivalInfo/components/FestivalContentReviewMediaSlider';
import { useAuth } from '@/context/AuthContext';
import { useDeleteWithConfirm } from '@/hooks/useDeleteWithConfirm';
import { deleteReview } from '@/apis/review/deleteReview';
import ConfirmModal from '@/components/modal/ConfirmModal';
import PickIcon from '@/components/common/PickIcon';
import { PICK_ICONS } from '@/constants/pickIcons';
import { ROUTE_PATH } from '@/constants/routes';
import { generatePath, useParams } from 'react-router-dom';
import useNav from '@/hooks/useNav';

interface FestivalContentReviewSectionProps {
  reviewsData: Review[];
  festivalTitle: string;
}
/**
 * 축제 내용 리뷰 섹션
 * @param reviewsData - 리뷰 데이터
 * @param festivalTitle - 축제 제목
 * @returns 축제 내용 리뷰 섹션
 */
const FestivalContentReviewSection = ({
  reviewsData,
  festivalTitle,
}: FestivalContentReviewSectionProps) => {
  const { userInfo } = useAuth();
  const { goTo } = useNav();
  const { festivalId } = useParams();
  const { isConfirmOpen, handleDelete, handleConfirmDelete, setIsConfirmOpen } =
    useDeleteWithConfirm(
      deleteReview,
      [['reviews'], ['festival', festivalId], ['festivals']],
      '리뷰가 삭제되었습니다.',
      '리뷰 삭제에 실패했습니다.',
    );

  const isMyReview = (review: Review) => {
    return userInfo?.userId === review.userId;
  };

  const handleEditReview = (reviewId: number) => {
    goTo(generatePath(ROUTE_PATH.REVIEW_EDIT, { reviewId: reviewId.toString() }));
  };

  if (!reviewsData) return null;
  if (reviewsData.length === 0) {
    return (
      <div className="ui-panel festival-detail-section">
        <h2 className="ui-section-title">리뷰</h2>
        <p className="text-sm text-gray-700">첫 번째 리뷰의 주인공이 되어보세요!</p>
      </div>
    );
  }

  return (
    <div className="ui-panel festival-detail-section">
      <h2 className="ui-section-title">리뷰 ({reviewsData.length})</h2>
      {reviewsData.map((review) => (
        <div key={review.reviewId} className="ui-inset festival-review-card">
          <div className="festival-detail-section-heading">
            <p className="font-medium text-gray-900 break-all">{review.reviewerName}</p>
            <div className="flex flex-wrap items-center gap-2">
              <StarRating rating={review.score} />
              {isMyReview(review) && (
                <div className="flex gap-1">
                  <button onClick={() => handleEditReview(review.reviewId)} aria-label="리뷰 수정">
                    <PickIcon name={PICK_ICONS.EDIT} size={40} />
                  </button>
                  <button onClick={() => handleDelete(review.reviewId)} aria-label="리뷰 삭제">
                    <PickIcon name={PICK_ICONS.DELETE} size={45} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <FestivalContentReviewMediaSlider review={review} festivalTitle={festivalTitle} />
          <p className="text-sm text-gray-700 break-all">{review.content}</p>
        </div>
      ))}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="리뷰 삭제"
        message="정말로 이 리뷰를 삭제하시겠습니까?"
      />
    </div>
  );
};
export default FestivalContentReviewSection;
