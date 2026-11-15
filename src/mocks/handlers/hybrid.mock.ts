import { http, HttpResponse } from 'msw';
import type { ApiResponseList } from '@/apis/apiResponse';
import type { PostFestivalsPickBody } from '@/apis/festivals/postFestivalsPick';
import PICK_STYLES from '@/constants/pickStyles';
import {
  localDate,
  mockUser,
  mockFestivals,
  mockReviews,
  mockNotices,
  mockFestivalPermissions,
  mockCustomFestivals,
  mockChats,
  mockMessages,
  reviewsForFestival,
} from '@/mocks/hybridData';

const readOnlyMessage = '읽기 전용 샘플 모드입니다. 실제 저장·전송·업로드는 지원하지 않습니다.';
const failure = (status: number, message: string) =>
  HttpResponse.json({ status, message }, { status });
const item = <T>(content: T) => HttpResponse.json({ content });
const paging = <T>(content: T[], url: URL) => {
  const page = Number(url.searchParams.get('page') ?? 0);
  const size = Number(url.searchParams.get('size') ?? 5);
  if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1)
    return failure(400, 'page와 size를 확인해주세요.');
  const offset = page * size;
  const values = content.slice(offset, offset + size);
  const sort = { empty: true, sorted: false, unsorted: true };
  const result: ApiResponseList<T> = {
    content: values,
    pageable: { pageNumber: page, pageSize: size, sort, offset, paged: true, unpaged: false },
    last: offset + size >= content.length,
    totalElements: content.length,
    totalPages: Math.ceil(content.length / size),
    first: page === 0,
    size,
    number: page,
    sort,
    numberOfElements: values.length,
  };
  return HttpResponse.json(result);
};
const regionFestivals = (areaCode: number) =>
  mockFestivals.filter((festival) => areaCode === 0 || festival.areaCode === areaCode);
const defaultForm: PostFestivalsPickBody = {
  areaCode: 1,
  styles: ['TRADITIONAL', 'NATURE'],
  isNewPlace: true,
  isSolo: false,
  prefersEnjoyment: true,
  isSpontaneous: false,
  additionalInfo: '지역 문화와 자연을 함께 즐기는 샘플 추천',
};
const isRecommendationBody = (body: unknown): body is PostFestivalsPickBody => {
  if (!body || typeof body !== 'object') return false;
  const data = body as Record<string, unknown>;
  return (
    typeof data.areaCode === 'number' &&
    regionFestivals(data.areaCode).length > 0 &&
    Array.isArray(data.styles) &&
    data.styles.length >= 1 &&
    data.styles.length <= 3 &&
    data.styles.every((style) => PICK_STYLES.some((entry) => entry.id === style)) &&
    ['isNewPlace', 'isSolo', 'prefersEnjoyment', 'isSpontaneous'].every(
      (key) => typeof data[key] === 'boolean',
    ) &&
    typeof data.additionalInfo === 'string'
  );
};

// Installed only by the opt-in development worker. It never falls through to a real API.
export const hybridHandlers = [
  http.all('*/api/*', async ({ request }) => {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method === 'POST' && path === '/api/users/logout')
      return new HttpResponse(null, { status: 200 });
    if (method === 'POST' && path === '/api/recommendations') {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return failure(400, '추천 입력을 확인해주세요.');
      }
      if (!isRecommendationBody(body)) return failure(400, '추천 입력을 확인해주세요.');
      return paging(regionFestivals(body.areaCode).slice(0, 2), url);
    }
    const chatCreate = path.match(/^\/api\/festivals\/(\d+)\/chatRooms$/);
    if (method === 'POST' && chatCreate) {
      const festival = mockFestivals.find((entry) => entry.id === Number(chatCreate[1]));
      return festival
        ? item({
            roomId: 1000 + festival.id,
            roomName: `${festival.title} 채팅`,
            festivalId: festival.id,
          })
        : failure(404, '샘플 축제를 찾을 수 없습니다.');
    }
    if (method !== 'GET') return failure(501, readOnlyMessage);
    if (path === '/api/users/my') return item(mockUser);
    if (path === '/api/users/role') return item({ isFestivalManagerOrAdmin: true });
    if (path === '/api/fm-permissions/my')
      return item({
        id: 1,
        department: 'FestaPick 샘플 운영팀',
        updatedDate: localDate(-3),
        state: 'APPROVED',
        docsUrls: [],
      });
    if (path === '/api/festival-permissions/my')
      return paging(
        mockFestivalPermissions.map(({ id, title, appliedDate, state }) => ({
          id,
          title,
          appliedDate,
          state,
        })),
        url,
      );
    const permissionDetail = path.match(/^\/api\/festival-permissions\/(\d+)$/);
    if (permissionDetail) {
      const permission = mockFestivalPermissions.find(
        (entry) => entry.id === Number(permissionDetail[1]),
      );
      return permission ? item(permission) : failure(404, '샘플 신청을 찾을 수 없습니다.');
    }
    const applyCheck = path.match(/^\/api\/festival-permissions\/festival\/(\d+)\/check$/);
    if (applyCheck) return item(false);
    if (path === '/api/festivals/my/custom') return paging(mockCustomFestivals, url);
    if (path === '/api/festivals/my')
      return paging(
        mockFestivals.filter((entry) => entry.managerId === mockUser.userId),
        url,
      );
    if (path === '/api/festivals/wishedBy/me')
      return paging(
        mockFestivals.filter((entry) => entry.isMyWish),
        url,
      );
    if (path === '/api/festivals/reviewedBy/me')
      return paging(
        mockFestivals.filter((festival) =>
          reviewsForFestival(festival.id).some((review) => review.userId === mockUser.userId),
        ),
        url,
      );
    const area = path.match(/^\/api\/festivals\/area\/(\d+)$/);
    if (area) {
      const current = (url.searchParams.get('current') ?? 'true') === 'true';
      const today = localDate();
      return paging(
        regionFestivals(Number(area[1])).filter(
          (festival) => !current || (festival.startDate <= today && today <= festival.endDate),
        ),
        url,
      );
    }
    if (path === '/api/festivals') {
      const keyword = (url.searchParams.get('keyword') ?? '').trim().toLocaleLowerCase();
      return paging(
        mockFestivals.filter((festival) =>
          `${festival.title} ${festival.addr1}`.toLocaleLowerCase().includes(keyword),
        ),
        url,
      );
    }
    const managerExists = path.match(/^\/api\/festivals\/(\d+)\/check-manager$/);
    if (managerExists)
      return item(
        mockFestivals.find((entry) => entry.id === Number(managerExists[1]))?.managerId != null,
      );
    const festivalReviews = path.match(/^\/api\/festivals\/(\d+)\/reviews$/);
    if (festivalReviews) return paging(reviewsForFestival(Number(festivalReviews[1])), url);
    const notices = path.match(/^\/api\/festivals\/(\d+)\/notices$/);
    if (notices) return paging(mockNotices, url);
    const notice = path.match(/^\/api\/festivals\/notices\/(\d+)$/);
    if (notice) {
      const value = mockNotices.find((entry) => entry.id === Number(notice[1]));
      return value ? item(value) : failure(404, '샘플 공지를 찾을 수 없습니다.');
    }
    const festivalDetail = path.match(/^\/api\/festivals\/(\d+)$/);
    if (festivalDetail) {
      const value = mockFestivals.find((entry) => entry.id === Number(festivalDetail[1]));
      return value ? item(value) : failure(404, '샘플 축제를 찾을 수 없습니다.');
    }
    if (path === '/api/reviews/my')
      return paging(
        mockReviews.filter((entry) => entry.userId === mockUser.userId),
        url,
      );
    const reviewDetail = path.match(/^\/api\/reviews\/(\d+)$/);
    if (reviewDetail) {
      const value = mockReviews.find((entry) => entry.reviewId === Number(reviewDetail[1]));
      return value ? item(value) : failure(404, '샘플 리뷰를 찾을 수 없습니다.');
    }
    if (path === '/api/recommendations/histories')
      return item({
        recommendedFestivals: regionFestivals(1).slice(0, 2),
        recommendationFormResponse: { ...defaultForm, userId: mockUser.userId },
      });
    if (path === '/api/chatRooms/me') return paging(mockChats, url);
    const messages = path.match(/^\/api\/chatRooms\/(\d+)\/messages$/);
    if (messages) {
      const size = Number(url.searchParams.get('size') ?? 20);
      const cursor = Number(url.searchParams.get('cursor') ?? 0);
      if (!Number.isInteger(size) || size < 1 || !Number.isInteger(cursor) || cursor < 0)
        return failure(400, 'cursor와 size를 확인해주세요.');
      const remaining = mockMessages.filter((message) => !cursor || message.id < cursor);
      const content = remaining.slice(0, size);
      return HttpResponse.json({
        content,
        hasMoreList: remaining.length > content.length,
        cursor: content.at(-1)?.id ?? cursor,
      });
    }
    return failure(501, readOnlyMessage);
  }),
];
