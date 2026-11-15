import { usePick } from '@/context/PickContext';
import type { PickStyleId } from '@/constants/pickStyles';

interface PickStyleCardProps {
  image: string;
  title: string;
  id: PickStyleId;
}

const PickStyleCard = ({ image, title, id }: PickStyleCardProps) => {
  const { selectedStyles, handleStyleSelect } = usePick();
  const isSelected = selectedStyles.includes(id);

  return (
    <button
      type="button"
      className="pick-style-card"
      aria-pressed={isSelected}
      onClick={() => handleStyleSelect(id)}
    >
      <div className="pick-style-content">
        <span className="pick-style-check" aria-hidden="true">
          {isSelected ? '✓' : '+'}
        </span>
        <img src={image} alt="" className="pick-style-art" />
        <span className="pick-style-name">{title}</span>
      </div>
    </button>
  );
};

export default PickStyleCard;
