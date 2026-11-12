import type { UserInfoResponse } from '@/types/UserType';
/**
 * 사용자 프로필 카드
 * @param userInfo - 사용자 정보
 * @returns 사용자 프로필 카드 컴포넌트
 * 사용자 프로필 이미지와 이름, 이메일을 표시합니다.
 */
const SettingsProfileCard = ({ userInfo }: { userInfo: UserInfoResponse['content'] }) => {
  return (
    <div style={{ borderTop: '4px solid var(--color-secondary-300)' }} className="ui-panel">
      <div className="flex items-center gap-4">
        {userInfo?.profileImageUrl ? (
          <img
            src={userInfo.profileImageUrl}
            alt="프로필"
            className="w-14 h-14 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div className="w-14 h-14 shrink-0 rounded-2xl bg-gray-200 flex items-center justify-center">
            <span className="text-ui-muted text-xl">👤</span>
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-lg leading-snug font-bold text-ui-ink break-words">
            {userInfo?.username}님 안녕하세요!
          </h2>
          <p className="text-sm leading-relaxed text-ui-muted [overflow-wrap:anywhere]">
            {userInfo?.email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsProfileCard;
