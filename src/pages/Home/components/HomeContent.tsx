import { useState } from 'react';
import Modal from '@/pages/Home/components/Modal';
import type { Pin } from '@/types/Pin';
import MAP_PINS from '@/constants/mapPins';
import HomeRegionMap from '@/pages/Home/components/HomeRegionMap';
import '../home.css';

const HomeContent = () => {
  const [view, setView] = useState<'map' | 'names'>('map');
  const [motionEnabled, setMotionEnabled] = useState(true);
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
        <h1 className="ui-title">설레는 축제 여행</h1>
        <p id="home-region-instruction" className="ui-body home-intro-copy">
          지도 속 지역 픽픽이를 누르고 취향에 맞는 축제를 만나보세요.
        </p>
      </div>
      <section className="home-map-panel" aria-label="지역 선택">
        <div className="home-map-tools">
          <h2 className="home-region-heading">지역 선택</h2>
          <div className="home-map-actions">
            {view === 'map' && (
              <button
                type="button"
                className="home-motion-control"
                aria-label="캐릭터 모션"
                aria-pressed={motionEnabled}
                title={motionEnabled ? '캐릭터 모션 끄기' : '캐릭터 모션 켜기'}
                onClick={() => setMotionEnabled((enabled) => !enabled)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  {motionEnabled ? (
                    <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
                  ) : (
                    <path d="m7 4 14 8-14 8z" />
                  )}
                </svg>
              </button>
            )}
            <div className="home-view-switch" role="group" aria-label="지역 보기 방식">
              <button
                type="button"
                aria-pressed={view === 'map'}
                aria-controls="home-region-view"
                onClick={() => setView('map')}
              >
                지도
              </button>
              <button
                type="button"
                aria-pressed={view === 'names'}
                aria-controls="home-region-view"
                onClick={() => setView('names')}
              >
                이름
              </button>
            </div>
          </div>
        </div>
        <div id="home-region-view">
          {view === 'map' ? (
            <HomeRegionMap onSelect={openFor} motionEnabled={motionEnabled && !openModal} />
          ) : (
            <div className="home-region-list" role="region" aria-label="지역 이름 선택">
              {MAP_PINS.map((pin) => (
                <button type="button" key={pin.id} onClick={() => openFor(pin)}>
                  {pin.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
      {openModal && <Modal isOpen={openModal} close={closeModal} pin={selectedPin} />}
    </div>
  );
};
export default HomeContent;
