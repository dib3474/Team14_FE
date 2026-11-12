import '../festival-info.css';
import LeftArrow from '@/components/icon/LeftArrowIcon';
import RightArrow from '@/components/icon/RightArrowIcon';
import { useSlider } from '@/hooks/useSlider';

const FestivalPoster = ({
  posterUrl,
  imageUrls,
  title,
}: {
  posterUrl: string;
  imageUrls: string[];
  title: string;
}) => {
  const allImages = [posterUrl, ...imageUrls];
  const {
    currentIndex,
    setCurrentIndex,
    containerRef,
    goToPrevious,
    goToNext,
    canGoPrevious,
    canGoNext,
    touchHandlers,
    getTransformStyle,
  } = useSlider({ itemCount: allImages.length });

  const arrowButtonClasses = 'festival-gallery-arrow';

  return (
    <div className="festival-poster">
      <div
        ref={containerRef}
        className="festival-poster-stage"
        role="region"
        aria-label="축제 이미지 갤러리"
        {...touchHandlers}
      >
        <div
          className="flex transition-transform duration-300 ease-out h-full"
          style={{
            transform: getTransformStyle(),
          }}
        >
          {allImages.map((imageUrl, index) => (
            <div key={index} className="w-full h-full flex-shrink-0">
              <img
                src={imageUrl}
                alt={`${title} - ${index + 1}`}
                className="w-full h-full object-contain select-none bg-ui-canvas"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* 데스크탑 화면일 때만 보입니다. */}
        {allImages.length > 1 && (
          <>
            {canGoPrevious && (
              <button
                onClick={goToPrevious}
                className={`${arrowButtonClasses} left-4`}
                aria-label="이전 이미지"
              >
                <LeftArrow className="stroke-white" />
              </button>
            )}

            {canGoNext && (
              <button
                onClick={goToNext}
                className={`${arrowButtonClasses} right-4`}
                aria-label="다음 이미지"
              >
                <RightArrow className="stroke-white" />
              </button>
            )}
          </>
        )}
      </div>

      {allImages.length > 1 && (
        <div className="festival-gallery-pagination" role="group" aria-label="축제 이미지 선택">
          {allImages.map((imageUrl, index) => (
            <button
              key={imageUrl}
              type="button"
              aria-label={`${index + 1}번 이미지 보기`}
              aria-pressed={index === currentIndex}
              onClick={() => setCurrentIndex(index)}
              className={`festival-gallery-dot ${
                index === currentIndex ? 'bg-primary-300' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FestivalPoster;
