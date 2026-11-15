import SpeechBubble from '@/components/common/SpeechBubble';

const ChatMessageItemMessage = ({ message, isSelf }: { message: string; isSelf: boolean }) => (
  <SpeechBubble tone={isSelf ? 'accent' : 'neutral'}>{message}</SpeechBubble>
);

export default ChatMessageItemMessage;
