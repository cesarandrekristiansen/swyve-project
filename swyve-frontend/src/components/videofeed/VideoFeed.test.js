import React from 'react';
import { render, screen } from '@testing-library/react';
import VideoFeed from './VideoFeed';
import * as videoHooks from '../../hooks/videoHooks';

jest.mock('../../auth/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1 } }),
}));


jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));
jest.mock('../../hooks/videoHooks');

describe('VideoFeed', () => {
  beforeEach(() => {
    videoHooks.useVideos.mockReturnValue({
      data: { pages: [[ { id: 7, username: 'bob' } ]] },
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
    });
  });

  it('shows loaded videos', () => {
    render(<VideoFeed />);
    expect(screen.getByText('bob')).toBeInTheDocument();
  });
});
