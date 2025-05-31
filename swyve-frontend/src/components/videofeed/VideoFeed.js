import React, { useRef, useEffect,  useState,  useCallback,} from "react";
import { FixedSizeList as List } from "react-window";
import { useVideos } from "../../hooks/videoHooks";
import VideoCard from "../videocard/VideoCard";
import Loading from "../../components/loading/Loading";
import "./VideoFeed.css";

const SCROLL_THRESHOLD_PX = 600;

function useDebouncedCallback(callback, delay) {
  const timeoutRef = useRef(null);

  const debouncedFn = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); }
      timeoutRef.current = setTimeout(() => {
        callback(...args);}, delay);
    },
    [callback, delay]
  );

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);}
    },[]
  );

  return debouncedFn;
}

export default function VideoFeed({
  videos: controlledVideos,
  hasMore: hasMoreProp = false,
  onLoadMore,
  startIndex = 0,
  onClose,
  showTabs = false,
}) {
  const isControlled = Array.isArray(controlledVideos);
  const [selectedTab, setSelectedTab] = useState("for-you");

  const type = selectedTab === "following" ? "following" : "all";
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useVideos({ type });

  const fetchedVideos = data?.pages.flat() || [];
  const allVideos = isControlled ? controlledVideos : fetchedVideos;
  const hasMore = isControlled ? hasMoreProp : hasNextPage;

  const listRef = useRef(null);
  const outerRef = useRef(null);

  const itemSize = window.innerHeight;

  useEffect(() => {
    if (listRef.current && startIndex > 0) {
      listRef.current.scrollToItem(startIndex, "start");
    }
  }, [startIndex]);
  const onScrollCallback = useCallback(
    ({ scrollDirection, scrollUpdateWasRequested, scrollOffset }) => {
      if (scrollUpdateWasRequested) {
        return;
      }
      debouncedSnap(scrollOffset);
    },
    []
  );

  const debouncedSnap = useDebouncedCallback((scrollOffset) => {
    if (!listRef.current) return;
    const exactIndex = scrollOffset / itemSize;
    const nearestIndex = Math.round(exactIndex);
    listRef.current.scrollToItem(nearestIndex, "start");
  }, 50);

  const handleScrollThreshold = useCallback(() => {
    const el = outerRef.current;
    if (
      !el ||
      isFetchingNextPage ||
      !(isControlled ? hasMoreProp : hasNextPage)
    )
      return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - (scrollTop + clientHeight) < SCROLL_THRESHOLD_PX) {
      isControlled ? onLoadMore?.() : fetchNextPage();
    }
  }, [
    fetchNextPage,
    isFetchingNextPage,
    isControlled,
    hasMoreProp,
    hasNextPage,
    onLoadMore,
  ]);

  const onScrollHandler = (e) => {
    handleScrollThreshold();
    const scrollOffset = outerRef.current?.scrollTop ?? 0;
    onScrollCallback({
      scrollOffset,
      scrollDirection: null,
      scrollUpdateWasRequested: false,
    });
  };

  const itemCount = allVideos.length;

  return (
    <div className="video-feed-background">
      {isFetching && !isFetchingNextPage && <Loading />}

      {showTabs && (
        <div className="feed-tabs">
          <button
            className={selectedTab === "for-you" ? "tab active" : "tab"}
            onClick={() => setSelectedTab("for-you")}
          >
            For you
          </button>
          <button
            className={selectedTab === "following" ? "tab active" : "tab"}
            onClick={() => setSelectedTab("following")}
          >
            Following
          </button>
        </div>
      )}
      {onClose && (
        <button className="video-feed-close" onClick={onClose}>
          ✕
        </button>
      )}

      <List
        className="video-feed-container-feed"
        height={window.innerHeight}
        width="100%"
        role="list"
        itemCount={itemCount}
        itemSize={itemSize}
        overscanCount={2}
        ref={listRef}
        outerRef={outerRef}
        onScroll={onScrollHandler}
        onItemsRendered={({ visibleStopIndex }) => {
          if (
            visibleStopIndex >= allVideos.length - 1 &&
            hasMore &&
            !isFetchingNextPage
          ) {
            isControlled ? onLoadMore?.() : fetchNextPage();
          }
        }}
      >
        {({ index, style }) => {
          const video = allVideos[index];
          if (!video) return null;
          return (
            <div style={style} className="video-feed-slide">
              <VideoCard video={video} />
            </div>
          );
        }}
      </List>
    </div>
  );
}
