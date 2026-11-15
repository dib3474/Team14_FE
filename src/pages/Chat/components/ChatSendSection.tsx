import Button from '@/components/common/Button';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useEffect, useRef } from 'react';

interface ChatSendSectionProps {
  message: string;
  handleMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  sendMessage: () => void;
  sendImageMessage: (imageInfo: { id: number; presignedUrl: string }) => void;
}

const ChatSendSection = ({
  message,
  handleMessageChange,
  handleKeyPress,
  sendMessage,
  sendImageMessage,
}: ChatSendSectionProps) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // message 변경 시 자동 높이 조절
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [message]);

  // 이미지 업로드
  const { pickAndUploadImages, imageInfos, setImageInfos } = useMediaUpload();

  const handleSend = () => {
    if (imageInfos.length === 1) {
      // 이미지 1개 전송
      sendImageMessage(imageInfos[0]);
      setImageInfos([]);
      // 메시지 전송
    } else if (message.trim().length > 0) {
      sendMessage();
    }
  };

  return (
    <div className="shrink-0 w-full">
      <div className="flex w-full min-w-0 items-end gap-2 rounded-[20px] border border-ui-line bg-ui-surface pl-4 pr-1 py-1 shadow-sm focus-within:border-secondary-500 focus-within:ring-2 focus-within:ring-secondary-100">
        {imageInfos.length === 0 ? (
          <textarea
            ref={textareaRef}
            aria-label="채팅 메시지"
            value={message}
            onChange={handleMessageChange}
            onKeyDown={(e) => {
              if (!e.shiftKey) {
                // Enter: 전송, Shift+Enter: 줄바꿈
                handleKeyPress(e);
              }
            }}
            placeholder="메시지 입력..."
            rows={1}
            maxLength={255}
            className="w-full min-w-0 min-h-11 max-h-32 py-3 bg-transparent text-base text-ui-ink outline-none placeholder:text-ui-muted resize-none overflow-y-auto whitespace-pre-wrap [overflow-wrap:anywhere] leading-6"
          />
        ) : (
          <div className="py-2 bg-transparent text-sm outline-none ">
            {imageInfos.map((image, index) => (
              <div key={index} className="relative ">
                <img
                  src={image.presignedUrl}
                  alt={`업로드된 이미지 ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
                <button
                  aria-label={`첨부 이미지 ${index + 1} 삭제`}
                  onClick={() => setImageInfos((prev) => prev.filter((_, i) => i !== index))}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <Button
          className="shrink-0 min-h-11 min-w-11 rounded-full text-sm"
          variant="icon"
          size="sm"
          onClick={
            message.trim().length > 0 || imageInfos.length > 0 ? handleSend : pickAndUploadImages
          }
          aria-label={
            message.trim().length > 0 || imageInfos.length > 0
              ? '메시지 보내기 (send)'
              : '사진 선택 (image)'
          }
        >
          {message.trim().length > 0 || imageInfos.length > 0 ? (
            <img src="/send.svg" alt="send" className="size-5" />
          ) : (
            <img src="/image.svg" alt="image" className="size-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatSendSection;
