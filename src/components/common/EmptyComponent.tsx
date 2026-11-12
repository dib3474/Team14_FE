interface EmptyComponentProps {
  title: string;
  description: string;
  className?: string;
}
/**
 * 빈 컴포넌트 (데이터가 없을 때 표시)
 * @param title - 제목
 * @param description - 설명
 * @returns 빈 컴포넌트
 */
const EmptyComponent = ({ title, description, className }: EmptyComponentProps) => {
  return (
    <div className={`ui-feedback ${className || ''}`} role="status">
      <p className="ui-section-title">{title}</p>
      <p className="ui-caption">{description}</p>
    </div>
  );
};

export default EmptyComponent;
