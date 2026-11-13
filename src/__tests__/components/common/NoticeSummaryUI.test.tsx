import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Summary from '@/pages/FestivalInfoNoticeList/components/FestivalInfoNoticeListInfoCard';
import fixture from '../../../../scripts/design-comparison/fixture.json';
test('festival summary keeps its existing callback keyboard accessible without nesting creation', async () => {
  const user = userEvent.setup(),
    open = vi.fn(),
    create = vi.fn();
  const { container } = render(
    <Summary
      festivalData={{ ...fixture.festivals[0], ...fixture.detail }}
      onClick={open}
      showCreateButton
      onCreateNotice={create}
    />,
  );
  const target = screen.getByRole('button', { name: /가평 양떼목장 수국축제.*축제 정보 보기/ });
  expect(screen.getByRole('heading', { level: 2 })).toBeVisible();
  expect(container.querySelector('button button')).toBeNull();
  target.focus();
  await user.keyboard('{Enter}');
  expect(open.mock.calls).toHaveLength(1);
  await user.click(screen.getByRole('button', { name: '공지사항 작성' }));
  expect(create.mock.calls).toHaveLength(1);
  expect(open.mock.calls).toHaveLength(1);
});
