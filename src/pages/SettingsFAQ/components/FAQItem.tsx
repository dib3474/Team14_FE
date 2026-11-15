import { useId } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}
/**
 * 자주 묻는 질문 아이템 컴포넌트
 * @param question - 질문
 * @param answer - 답변
 * @returns 자주 묻는 질문 아이템 컴포넌트
 * 주로 축제 등록,관리 관한 사항들 적어두었습니다.
 */
const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => {
  const answerId = useId();
  return (
    <div className="border border-ui-line rounded-[20px] overflow-hidden bg-ui-surface">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={answerId}
        onClick={onToggle}
        className="w-full px-5 py-5 flex items-center justify-between gap-3 hover:bg-secondary-50 transition-colors focus-visible:outline-2 focus-visible:outline-secondary-600"
      >
        <div className="flex items-start gap-3 flex-1 text-left">
          <span className="text-primary-700 font-bold text-lg shrink-0">Q.</span>
          <span className="text-sm font-semibold text-ui-ink break-words">{question}</span>
        </div>
        <svg
          className={`w-5 h-5 text-ui-muted transition-transform shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div id={answerId} className="px-5 py-5 bg-secondary-50 border-t border-ui-line">
          <div className="flex items-start gap-3">
            <span className="text-secondary-700 font-bold text-lg shrink-0">A.</span>
            <p className="ui-body text-ui-ink whitespace-pre-line break-words">{answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQItem;
