const ChatMessageItemMessage = ({ message, isSelf }: { message: string; isSelf: boolean }) => {
  return (
    <div
      className={`inline-block max-w-full rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] ${isSelf ? 'bg-primary-100 text-ui-ink rounded-tr-sm' : 'bg-white border border-ui-line text-ui-ink rounded-tl-sm'}`}
    >
      {message}
    </div>
  );
};

export default ChatMessageItemMessage;
