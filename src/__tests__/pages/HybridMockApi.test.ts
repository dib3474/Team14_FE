import { server } from '@/mocks/server';
import { hybridHandlers } from '@/mocks/handlers/hybrid.mock';
import MAP_PINS from '@/constants/mapPins';
import getFestivals from '@/apis/festivals/getFestivals';
import getFestivalInfo from '@/apis/festivals/getFestivalInfo';
import { searchFestivals } from '@/apis/search/searchFestivals';
import { getMyReviews } from '@/apis/review/getMyReviews';
import getSingleReview from '@/apis/review/getSingleReview';
import { getMyFMPermission } from '@/apis/festivalManager/getMyFMPermission';
import { getMyFestivalPermissions } from '@/apis/festivalManager/getMyFestivalPermissions';
import { getMyFestivalPermissionDetail } from '@/apis/festivalManager/getMyFestivalPermissionDetail';
import { getMyCustomFestivals } from '@/apis/festivals/getMyCustomFestivals';
import { checkFestivalManagerExist } from '@/apis/festivalManager/checkFestivalManagerExist';
import { checkFestivalManagerApply } from '@/apis/festivalManager/checkFestivalManagerApply';
import getUserInfo from '@/apis/user/getUserInfo';
import getUserRole from '@/apis/user/getUserRole';
import getReview from '@/apis/review/getReview';
import { getFestivalNotices } from '@/apis/notice/getFestivalNotices';
import { getRecommendationHistories } from '@/apis/ai/getRecommendationHistories';
import postFestivalsPick from '@/apis/festivals/postFestivalsPick';
import { getMyChats } from '@/apis/chat/getMyChats';
import { getMyFestivals } from '@/apis/festivals/getMyFestivals';
import { getMyWishFestivals } from '@/apis/wish/getMyWishFestivals';
import { getMyReviewFestivals } from '@/apis/review/getMyReviewFestivals';
import postCreateChatRoom from '@/apis/chat/postCreateChatRoom';
import getChatRoomMessage from '@/apis/chat/getChatRoomMessage';
import { apiInstance } from '@/apis/apiInstance';

beforeEach(() => server.use(...hybridHandlers));
const date = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

test('지역별 샘플은 진행·예정·종료를 갖고 현재 필터와 이후 페이지가 정확하다', async () => {
  for (const pin of MAP_PINS.filter((item) => item.areaId !== '0')) {
    const all = (await getFestivals({ areaId: pin.areaId, current: false, size: 2 })).data;
    const later = (await getFestivals({ areaId: pin.areaId, current: false, size: 2, page: 1 }))
      .data;
    expect(all.content).toHaveLength(2);
    expect(all.totalElements).toBe(3);
    expect(all.last).toBe(false);
    expect(later.content).toHaveLength(1);
    expect(later.number).toBe(1);
    expect(later.pageable.offset).toBe(2);
    expect(later.last).toBe(true);
    expect(new Set([...all.content, ...later.content].map((item) => item.id)).size).toBe(3);
    const current = (await getFestivals({ areaId: pin.areaId, current: true })).data;
    expect(current.content).toHaveLength(1);
    expect(current.content[0].startDate <= date() && current.content[0].endDate >= date()).toBe(
      true,
    );
    expect(current.content[0].title).toContain('샘플');
    expect(current.content[0].areaCode).toBe(Number(pin.areaId));
  }
  const national = (await getFestivals({ areaId: '0', current: false, size: 5, page: 1 })).data;
  expect(national.content).toHaveLength(5);
  expect(national.totalElements).toBe(48);
  const exhausted = (await getFestivals({ areaId: '0', current: false, size: 5, page: 99 })).data;
  expect(exhausted.content).toEqual([]);
  expect(exhausted.last).toBe(true);
});

test('검색은 키워드와 페이지를 적용하고 상세 포스터와 갤러리를 Vite 자산 URL로 제공한다', async () => {
  const found = (await searchFestivals({ keyword: '제주', page: 1, size: 1 })).data;
  expect(found.totalElements).toBe(3);
  expect(found.content).toHaveLength(1);
  expect(found.content[0].title).toContain('제주');
  expect((await searchFestivals({ keyword: '존재하지않는샘플' })).data.content).toEqual([]);
  const owned = (await getFestivalInfo({ festivalId: '1' })).data.content;
  expect(owned.managerId).toBe(7);
  expect(owned.posterInfo).toMatch(/flowers\.png/);
  expect(owned.imageInfos.every((url) => url.length > 0 && !url.includes('__fixtures'))).toBe(true);
  expect((await getFestivalInfo({ festivalId: '2' })).data.content.managerId).toBeNull();
  const managed = (await getMyFestivals(0, 2)).data;
  expect(managed.content).toHaveLength(2);
  expect(managed.content.every((festival) => festival.managerId === 7)).toBe(true);
  const wished = (await getMyWishFestivals(1, 2)).data;
  expect(wished.content).toHaveLength(2);
  expect(wished.number).toBe(1);
  const reviewed = (await getMyReviewFestivals(0, 2)).data;
  expect(reviewed.content).toHaveLength(2);
});

test('내 리뷰 목록과 수정 ID는 같은 실제 내용과 미디어를 반환한다', async () => {
  const mine = (await getMyReviews(0, 2)).data;
  expect(mine.content).toHaveLength(2);
  expect(mine.last).toBe(false);
  for (const item of mine.content) {
    const detail = (await getSingleReview(item.reviewId)).data.content;
    expect(detail.userId).toBe(7);
    expect(detail.content).toBe(item.content);
    expect(detail.festivalTitle).toBe(item.festivalTitle);
    expect(detail.score).toBe(item.score);
    expect(detail.imageUrls).toEqual(item.imageUrls);
    expect(detail.content.length).toBeGreaterThan(2);
  }
  const reviews = (await getReview({ festivalId: '1' })).data;
  expect(reviews.content.some((item) => item.userId === 7)).toBe(true);
});

test('설정과 신청 조회는 실제 타입의 상태·날짜·문서·boolean 응답을 제공한다', async () => {
  expect((await getUserInfo()).data.content.userId).toBe(7);
  expect((await getUserRole()).data.content.isFestivalManagerOrAdmin).toBe(true);
  const fm = (await getMyFMPermission()).data.content;
  expect(fm.state).toBe('APPROVED');
  expect(fm.department).toBeTruthy();
  expect(fm.updatedDate).toBeTruthy();
  expect(fm.docsUrls).toEqual([]);
  const applications = (await getMyFestivalPermissions(0, 2)).data;
  expect(applications.content).toHaveLength(2);
  expect(applications.last).toBe(false);
  const detail = (await getMyFestivalPermissionDetail(String(applications.content[0].id))).data
    .content;
  expect(detail).toMatchObject(applications.content[0]);
  expect(detail.posterImg).toBeTruthy();
  expect(detail.docs).toEqual([]);
  const custom = (await getMyCustomFestivals(0, 2)).data;
  expect(custom.content[0]).toMatchObject({
    id: expect.any(Number),
    title: expect.any(String),
    updatedDate: expect.any(String),
    state: expect.any(String),
  });
  expect((await checkFestivalManagerExist('1')).data.content).toBe(true);
  expect((await checkFestivalManagerExist('2')).data.content).toBe(false);
  expect((await checkFestivalManagerApply('2')).data.content).toBe(false);
});

test('공지·추천·채팅 조회와 안전한 도출 POST가 원래 wire shape을 사용한다', async () => {
  const notices = (await getFestivalNotices('1', 1, 1)).data;
  expect(notices.content).toHaveLength(1);
  expect(notices.number).toBe(1);
  expect(notices.content[0].title).toContain('샘플');
  expect(
    (await apiInstance.get(`/api/festivals/notices/${notices.content[0].id}`)).data.content,
  ).toEqual(notices.content[0]);
  const history = (await getRecommendationHistories()).data.content;
  expect(history.recommendationFormResponse.userId).toBe(7);
  expect(history.recommendationFormResponse.styles).toContain('TRADITIONAL');
  const picked = (
    await postFestivalsPick({
      requestData: {
        areaCode: 39,
        styles: ['TRADITIONAL'],
        isNewPlace: true,
        isSolo: false,
        prefersEnjoyment: true,
        isSpontaneous: false,
        additionalInfo: '샘플',
      },
    })
  ).data;
  expect(picked.content.length).toBeGreaterThan(0);
  expect(picked.content.every((item) => item.areaCode === 39)).toBe(true);
  const chats = (await getMyChats(0, 1)).data;
  expect(chats.content).toHaveLength(1);
  expect(chats.last).toBe(false);
  const room = (await postCreateChatRoom({ festivalId: '1' })).data.content;
  expect(room.festivalId).toBe(1);
  const messages = (await getChatRoomMessage({ chatRoomId: String(room.roomId), size: 1 })).data;
  expect(messages.content).toHaveLength(1);
  expect(messages.hasMoreList).toBe(true);
  const next = (
    await getChatRoomMessage({ chatRoomId: String(room.roomId), size: 1, cursor: messages.cursor })
  ).data;
  expect(next.content[0].id).not.toBe(messages.content[0].id);
});

test('알 수 없는 API와 실제 쓰기는 서버로 빠지지 않고 읽기 전용 501로 응답한다', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    await expect(apiInstance.get('/api/hybrid-unknown')).rejects.toMatchObject({
      response: { status: 501, data: { message: expect.stringContaining('읽기 전용') } },
    });
    await expect(apiInstance.post('/api/festivals', { title: 'no write' })).rejects.toMatchObject({
      response: { status: 501 },
    });
  } finally {
    log.mockRestore();
  }
});
