import MAP_PINS from '@/constants/mapPins';
import OCEAN_PINS from '@/constants/oceanPins';
import type { Pin } from '@/types/Pin';

const HomeRegionMap = ({ onSelect }: { onSelect: (pin: Pin) => void }) => (
  <section className="home-map-panel" aria-label="전국 축제 지도">
    <p className="home-map-caption">지도에서 지역을 골라보세요</p>
    <div className="home-map-stage">
      <img
        src="/koreamap.svg"
        width={398}
        height={729}
        className="home-map-image"
        alt="대한민국 지역 지도"
        fetchPriority="high"
      />
      {MAP_PINS.map((pin) => (
        <button
          key={pin.id}
          type="button"
          className="home-map-pin"
          style={{ top: `${pin.top}%`, left: `${pin.left}%` }}
          onClick={() => onSelect(pin)}
          aria-label={pin.name}
        >
          <img src={pin.icon} alt="" width={28} height={36} draggable={false} />
        </button>
      ))}
      {OCEAN_PINS.map((pin) => (
        <img
          key={pin.id}
          src={pin.icon}
          alt=""
          className="home-ocean-pin"
          style={{ top: `${pin.top}%`, left: `${pin.left}%` }}
          draggable={false}
        />
      ))}
    </div>
  </section>
);
export default HomeRegionMap;
