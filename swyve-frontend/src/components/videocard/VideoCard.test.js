import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';               // <-- her
import { AuthProvider } from '../../auth/AuthContext';
import VideoCard from './VideoCard';

const mockVideo = {
  id: 1,
  url: 'https://example.com/video.mp4',
  username: 'u',
  profile_pic_url: null,
  isliked: false,
  likes_count: '0',
  comment_count: '0',
  user_id: 42,
};

const TestWrapper = ({ children }) => (
  <AuthProvider>
    <MemoryRouter>{children}</MemoryRouter>
  </AuthProvider>
);

describe.skip('VideoCard', () => {
  test('renderer UI', () => {
    render(<VideoCard video={mockVideo} />, { wrapper: TestWrapper });
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    expect(screen.getByText('@u')).toBeInTheDocument();
  });

  test('toggler like‐state', () => {
    render(<VideoCard video={mockVideo} />, { wrapper: TestWrapper });
    const likeBtn = screen.getByRole('button', { name: /heart/i });
    fireEvent.click(likeBtn);
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
