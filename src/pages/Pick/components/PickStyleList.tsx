import PickStyleCard from '@/pages/Pick/components/PickStyleCard';
import PICK_STYLES from '@/constants/pickStyles';

const PickStyleList = () => {
  return (
    <div className="pick-style-grid" role="group" aria-label="축제 스타일">
      {PICK_STYLES.map((style) => (
        <PickStyleCard key={style.id} image={style.image} title={style.name} id={style.id} />
      ))}
    </div>
  );
};

export default PickStyleList;
