import { useState } from 'react';
import Modal from '@/pages/Home/components/Modal';
import type { Pin } from '@/types/Pin';
import MAP_PINS from '@/constants/mapPins';
import OCEAN_PINS from '@/constants/oceanPins';
import '../home.css';

const STAGE_W = 480;
const STAGE_H = 467;

const HomeContent = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const openFor = (pin: Pin) => {
    setSelectedPin(pin);
    setOpenModal(true);
  };
  const closeModal = () => {
    setOpenModal(false);
    setSelectedPin(null);
  };

  return (
    <div className="ui-page home-page">
      <div className="home-intro">
        <p className="ui-eyebrow">어디로 떠나볼까요?</p>
        <h1 className="ui-title">
          설레는 축제 여행,
          <br />
          나의 다음 픽은?
        </h1>
        <p className="ui-body text-ui-muted">
          지도 속 지역 친구를 누르고 취향에 맞는 축제를 만나보세요.
        </p>
      </div>
      <section className="home-map-panel" aria-label="전국 축제 지도">
        <div className="home-map-stage" style={{ aspectRatio: `${STAGE_W}/${STAGE_H}` }}>
          <img
            src="/koreamap.svg"
            width={STAGE_W}
            height={STAGE_H}
            className="absolute inset-0 w-full h-full object-contain select-none"
            alt="대한민국 지역 지도"
          />
          <div className="absolute inset-0">
            {MAP_PINS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="home-map-pin"
                style={{ top: `${p.top}%`, left: `${p.left}%` }}
                onClick={() => openFor(p)}
                aria-label={p.name}
              >
                <img src={p.icon} alt="" draggable={false} />
              </button>
            ))}
            {OCEAN_PINS.map((p) => (
              <div
                key={p.id}
                className="home-ocean-pin"
                style={{ top: `${p.top}%`, left: `${p.left}%` }}
              >
                <img src={p.icon} alt={p.name} draggable={false} />
              </div>
            ))}
          </div>
        </div>
        <p className="ui-caption home-map-caption">
          지역을 선택하면 AI 추천과 지역 축제를 볼 수 있어요.
        </p>
      </section>
      <section className="ui-panel home-region-section" aria-labelledby="home-region-title">
        <h2 id="home-region-title" className="ui-section-title">
          지역 이름으로 찾아보기
        </h2>
        <div className="home-region-list">
          {MAP_PINS.map((p) => (
            <button type="button" key={p.id} onClick={() => openFor(p)}>
              {p.name}
            </button>
          ))}
        </div>
      </section>
      {openModal && <Modal isOpen={openModal} close={closeModal} pin={selectedPin} />}
    </div>
  );
};
export default HomeContent;
