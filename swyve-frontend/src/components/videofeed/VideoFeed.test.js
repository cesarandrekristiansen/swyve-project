import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider } from '../../auth/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import VideoFeed from './VideoFeed';
import * as hooks from '../../hooks/videoHooks';

const TestWrapper = ({ children }) => (
  <AuthProvider>
    <MemoryRouter>{children}</MemoryRouter>
  </AuthProvider>
);

// enkel side med to videoer
const fakePages = [
  [
    { id: 1, url: 'a', username: 'u1', profile_pic_url: null, isliked: false, likes_count: 0, comment_count: 0, user_id: 1 },
    { id: 2, url: 'b', username: 'u2', profile_pic_url: null, isliked: false, likes_count: 0, comment_count: 0, user_id: 2 },
  ]
];

describe.skip('VideoFeed', () => {
  beforeEach(() => {
    jest.spyOn(hooks, 'useVideos').mockReturnValue({
      data: { pages: fakePages },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
    });
  });
  afterEach(() => jest.restoreAllMocks());

  test('viser initiale videoer', () => {
    render(<VideoFeed />, { wrapper: TestWrapper });
    expect(screen.getByText('u1')).toBeInTheDocument();
    expect(screen.getByText('u2')).toBeInTheDocument();
  });

  test('laster flere når man scroller til bunn', () => {
    const fetchNextPage = jest.fn();
    hooks.useVideos.mockReturnValueOnce({
      data: { pages: fakePages },
      fetchNextPage,
      hasNextPage: true,
      isFetching: false,
      isFetchingNextPage: false,
    });

    render(<VideoFeed />, { wrapper: TestWrapper });

    // trigger scroll‐event manuelt
    const list = screen.getByRole('list');
    act(() => {
      list.scrollTop = 9999;
      list.dispatchEvent(new Event('scroll'));
    });

    expect(fetchNextPage).toHaveBeenCalled();
  });
});
