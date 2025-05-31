import { useInfiniteQuery } from '@tanstack/react-query';

const LIMIT = 5;

async function fetchVideos({ pageParam = 0, queryKey }) {
  const [, { type, userId }] = queryKey;
  const params = new URLSearchParams({ limit: LIMIT, offset: pageParam });
  let url;

  if (type === 'user' && userId) {
    url = `${process.env.REACT_APP_BASE_URL}/api/users/${userId}/videos?${params}`;
  } else if (type === 'following') {
    url = `${process.env.REACT_APP_BASE_URL}/api/videos/following?${params}`;
  } else {
    url = `${process.env.REACT_APP_BASE_URL}/api/videos?${params}`;
  }

  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Error fetching videos');
  return res.json();
}

export function useVideos({ type = 'all', userId }) {
  return useInfiniteQuery({
    queryKey: ['videos', { type, userId }],
    queryFn: fetchVideos,
    getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === LIMIT
          ? allPages.length * LIMIT
          : undefined;
      }
  });
}
