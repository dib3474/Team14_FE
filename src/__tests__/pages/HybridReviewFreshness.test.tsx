import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import MyPageOwnReviewPreviews from '@/pages/My/components/MyPageOwnReviewPreviews';
test('returning to my reviews refreshes a previously cached preview', async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 300000 } },
  });
  const review = {
    reviewId: 900,
    reviewerName: '나',
    festivalTitle: '서울 축제',
    content: '이전 내용',
    score: 4,
    imageUrls: [],
    videoUrl: '',
  };
  const data = { content: [review], last: true, totalElements: 1 };
  client.setQueryData(['myReviews', 'preview', 5], { pages: [{ data }], pageParams: [0] });
  server.use(
    http.get('*/api/reviews/my', () =>
      HttpResponse.json({
        ...data,
        content: [{ ...review, content: '방금 작성하거나 수정한 리뷰' }],
      }),
    ),
  );
  render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <MyPageOwnReviewPreviews />
      </QueryClientProvider>
    </MemoryRouter>,
  );
  expect(await screen.findByText('방금 작성하거나 수정한 리뷰')).toBeVisible();
});
