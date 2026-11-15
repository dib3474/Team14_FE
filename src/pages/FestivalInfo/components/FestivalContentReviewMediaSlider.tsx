import { useState } from 'react';
import type { Review } from '@/apis/review/getReview';
import ImageModal from '@/components/modal/ImageModal';

const FestivalContentReviewMediaSlider = ({
  review,
  festivalTitle,
}: {
  review: Review;
  festivalTitle: string;
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const mediaItems = [
    ...(review.videoUrl ? [{ type: 'video' as const, url: review.videoUrl }] : []),
    ...(review.imageUrls.length > 0
      ? review.imageUrls.map((url) => ({ type: 'image' as const, url }))
      : []),
  ];

  if (mediaItems.length === 0) return null;

  const handleMediaClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageModalOpen(true);
  };

  return (
    <>
      <div className="relative w-full h-full">
        <div className="flex overflow-x-auto pb-2 gap-2 h-full sm:pb-0">
          {mediaItems.map((item, index) => (
            <button
              key={index}
              type="button"
              aria-label={
                item.type === 'video'
                  ? `리뷰 동영상 ${index + 1} 재생`
                  : `리뷰 이미지 ${index + 1} 확대`
              }
              onClick={() => handleMediaClick(index)}
              className="relative flex-shrink-0 size-32 rounded-lg overflow-hidden cursor-pointer"
            >
              {item.type === 'video' ? (
                <span className="relative block w-full h-full">
                  <video src={item.url} className="w-full h-full object-cover" />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center bg-black/30"
                  >
                    <span className="size-10 bg-black/60 rounded-full flex items-center justify-center">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-white"
                      >
                        <path d="M8 5v14l11-7z" fill="currentColor" />
                      </svg>
                    </span>
                  </span>
                </span>
              ) : (
                <img
                  src={item.url}
                  alt="리뷰 이미지"
                  className="w-full h-full object-cover transition-transform"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {isImageModalOpen && (
        <ImageModal
          mediaItems={mediaItems}
          selectedMediaIndex={selectedImageIndex}
          onClose={() => setIsImageModalOpen(false)}
          title={festivalTitle}
        />
      )}
    </>
  );
};

export default FestivalContentReviewMediaSlider;
