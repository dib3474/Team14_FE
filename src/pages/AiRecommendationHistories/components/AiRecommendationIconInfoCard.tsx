interface AiRecommendationIconInfoCardProps {
  label: string;
  icon?: string;
  iconAlt?: string;
  value: string | number;
  iconSize?: 'sm' | 'md' | 'lg';
}

const AiRecommendationIconInfoCard = ({
  label,
  icon,
  iconAlt = '',
  value,
  iconSize = 'md',
}: AiRecommendationIconInfoCardProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  return (
    <div className="ui-inset ai-choice-card">
      <span className="ui-caption">{label}</span>
      {icon && (
        <img
          src={icon}
          alt={iconAlt || label}
          className={`${sizeClasses[iconSize]} object-contain`}
        />
      )}
      <span className="ui-body font-bold">{value}</span>
    </div>
  );
};

export default AiRecommendationIconInfoCard;
