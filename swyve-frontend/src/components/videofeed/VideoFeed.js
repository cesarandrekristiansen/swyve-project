import React, { useRef, useEffect, useState, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import { useVideos } from "../../hooks/videoHooks";
import VideoCard from "../videocard/VideoCard";
import Loading from "../../components/loading/Loading";
import "./VideoFeed.css";

const SCROLL_THRESHOLD_PX = 700;

function useViewportHeight() {
  const getVH = () =>
    window.visualViewport?.height ?? window.innerHeight;

  const [vh, setVh] = useState(getVH());

  useEffect(() => {
    const onResize = () => setVh(getVH());
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onResize);
      return () =>
        window.visualViewport.removeEventListener("resize", onResize);
    } else {
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
  }, []);

  return vh;
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
  const vh = useViewportHeight();
  
//hook based on tabs
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

  const listRef = useRef();
  const outerRef = useRef();


  useEffect(() => {
    if (listRef.current && startIndex > 0) {
      listRef.current.scrollToItem(startIndex, "start");
    }
  }, [startIndex]);

  // Infinite‐scroll threshold handler
  const handleScroll = useCallback(() => {
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

  const itemCount = allVideos.length;

  return (
    <div className="video-feed-background">
      {isFetching && !isFetchingNextPage  && <Loading />}

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
        height={vh}
        role="list"
        width="100%"
        itemCount={itemCount}
        itemSize={vh}
        overscanCount={2}
        ref={listRef}
        outerRef={outerRef}
        onScroll={handleScroll}
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
                    if (!isControlled && index === allVideos.length) {
                      return (
                        <div style={style} className="loading-item">
                          {Loading ? "Loading…" : ""}
                        </div>
                      );
                    }
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
