import type { CSSProperties } from 'react';
import SpeechBubble from '@/components/common/SpeechBubble';
import MAP_PINS from '@/constants/mapPins';
import OCEAN_PINS from '@/constants/oceanPins';
import type { Pin } from '@/types/Pin';

const HomeRegionMap = ({
  onSelect,
  motionEnabled = true,
}: {
  onSelect: (pin: Pin) => void;
  motionEnabled?: boolean;
}) => (
  <div
    className="home-map-content"
    role="region"
    aria-label="전국 축제 지도"
    aria-describedby="home-region-instruction"
    data-motion={motionEnabled ? 'on' : 'off'}
  >
    <div
      className="home-map-stage"
      style={{ '--region-cycle': `${MAP_PINS.length * 1.2}s` } as CSSProperties}
    >
      <img
        src="/koreamap.svg"
        width={398}
        height={729}
        className="home-map-image"
        alt="대한민국 지역 지도"
        fetchPriority="high"
      />
      {MAP_PINS.map((pin, index) => (
        <button
          key={pin.id}
          type="button"
          className="home-map-pin"
          style={
            {
              top: `${pin.top}%`,
              left: `${pin.left}%`,
              '--region-delay': `${(index * 1.2).toFixed(1)}s`,
            } as CSSProperties
          }
          onClick={() => onSelect(pin)}
          aria-label={pin.name}
        >
          <img src={pin.icon} alt="" width={28} height={36} draggable={false} />
          <span className="home-region-label" aria-hidden="true">
            <SpeechBubble as="span" compact tail>
              {pin.name}
            </SpeechBubble>
          </span>
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
  </div>
);
export default HomeRegionMap;
