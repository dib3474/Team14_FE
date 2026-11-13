import { useState } from 'react';
import Modal from '@/pages/Home/components/Modal';
import type { Pin } from '@/types/Pin';
import MAP_PINS from '@/constants/mapPins';
import HomeRegionMap from '@/pages/Home/components/HomeRegionMap';
import '../home.css';

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
      <HomeRegionMap onSelect={openFor} />
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
