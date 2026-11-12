import ImageModal, { type MediaItem } from '@/components/modal/ImageModal';
import { useState } from 'react';

const ChatMessageItemImage = ({ imageUrl }: { imageUrl: string }) => {
  const mediaItems: MediaItem[] = [{ type: 'image', url: imageUrl }];
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  return (
    <div className="inline-block max-w-full rounded-2xl bg-ui-surface p-2 border border-ui-line">
      <button
        type="button"
        aria-label="채팅 이미지 크게 보기"
        onClick={() => setIsImageModalOpen(true)}
        className="block rounded-xl focus-visible:outline-2 focus-visible:outline-secondary-600"
      >
        <img
          src={imageUrl}
          alt="채팅에 첨부한 이미지"
          className="w-40 max-w-full max-h-60 object-contain rounded-xl"
        />
      </button>
      {isImageModalOpen && (
        <ImageModal
          mediaItems={mediaItems}
          selectedMediaIndex={0}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatMessageItemImage;
