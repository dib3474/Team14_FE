import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockModeMenu from '@/mocks/MockModeMenu';
import { mockScreens } from '@/mocks/mockScreens';

test('Mock launcher opens the complete screen list without changing destinations', async () => {
  const user = userEvent.setup();
  render(<MockModeMenu />);
  const launcher = screen.getByRole('button', { name: 'Mock 화면 목록 열기' });
  expect(launcher).toHaveTextContent('Mock');
  expect(launcher).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await user.click(launcher);
  expect(launcher).toHaveAttribute('aria-expanded', 'true');
  const dialog = screen.getByRole('dialog', { name: '목 화면 바로가기' });
  expect(within(dialog).getAllByRole('link')).toHaveLength(mockScreens.length);
  for (const [name, to] of mockScreens) {
    expect(within(dialog).getByRole('link', { name })).toHaveAttribute('href', to);
  }
  await user.click(screen.getByRole('button', { name: '목 화면 목록 닫기' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(launcher).toHaveFocus();
});

test('Mock screen list keeps keyboard focus inside and restores it on Escape', async () => {
  const user = userEvent.setup();
  document.body.style.overflow = 'auto';
  render(<MockModeMenu />);
  const launcher = screen.getByRole('button', { name: 'Mock 화면 목록 열기' });
  await user.click(launcher);
  const close = screen.getByRole('button', { name: '목 화면 목록 닫기' });
  expect(close).toHaveFocus();
  expect(document.body.style.overflow).toBe('hidden');
  await user.tab({ shift: true });
  expect(screen.getByRole('link', { name: '404 안내' })).toHaveFocus();
  await user.tab();
  expect(close).toHaveFocus();
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(launcher).toHaveFocus();
  expect(document.body.style.overflow).toBe('auto');
  document.body.style.overflow = '';
});

test('clicking the list content keeps it open and clicking its backdrop closes it', async () => {
  const user = userEvent.setup();
  render(<MockModeMenu />);
  const launcher = screen.getByRole('button', { name: 'Mock 화면 목록 열기' });
  await user.click(launcher);
  await user.click(screen.getByRole('heading', { name: '목 화면 바로가기' }));
  expect(screen.getByRole('dialog')).toBeVisible();
  fireEvent.click(screen.getByRole('dialog'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(launcher).toHaveFocus();
});
