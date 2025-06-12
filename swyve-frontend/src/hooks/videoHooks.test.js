import { useVideos } from './videoHooks';

describe('useVideos hook', () => {
  it('is exported and is a function', () => {
    expect(typeof useVideos).toBe('function');
  });
});
import * as videoHooks from './videoHooks';

describe('videoHooks module', () => {
  it('exports useVideos hook', () => {
    expect(typeof videoHooks.useVideos).toBe('function');
  });
});