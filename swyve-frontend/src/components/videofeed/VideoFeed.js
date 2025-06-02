import React, { useRef, useEffect, useState, useCallback } from "react"
import { useVideos } from "../../hooks/videoHooks"
import VideoCard from "../videocard/VideoCard"
import Loading from "../../components/loading/Loading"
import "./VideoFeed.css"
import { Helmet } from "react-helmet"

const SCROLL_THRESHOLD_PX = 600

function useDebouncedCallback(callback, delay) {
  const timeoutRef = useRef(null)

  const debouncedFn = useCallback(
    (...args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return debouncedFn
}

export default function VideoFeed({
  videos: controlledVideos,
  hasMore: hasMoreProp = false,
  onLoadMore,
  startIndex = 0,
  onClose,
  showTabs = false,
}) {
  const isControlled = Array.isArray(controlledVideos)
  const [selectedTab, setSelectedTab] = useState("for-you")
  const [currentIndex, setCurrentIndex] = useState(startIndex > 0 ? startIndex : 0)

  const type = selectedTab === "following" ? "following" : "all"
  const userId = null

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useVideos({ type, userId })

  const fetchedVideos = data.pages.flat()
  const allVideos = isControlled ? controlledVideos : fetchedVideos
  const hasMore = isControlled ? hasMoreProp : hasNextPage

  const containerRef = useRef(null)
  const itemHeight = window.innerHeight

  useEffect(() => {
    if (containerRef.current && startIndex > 0) {
      containerRef.current.scrollTo({
        top: startIndex * itemHeight,
        behavior: "auto",
      })
      setCurrentIndex(startIndex)
    }
  }, [startIndex, itemHeight])

  const debouncedIndexUpdate = useDebouncedCallback((scrollTop) => {
    const approxIdx = Math.round(scrollTop / itemHeight)
    if (approxIdx !== currentIndex) setCurrentIndex(approxIdx)
  }, 40)

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return

    const { scrollTop, scrollHeight, clientHeight } = el
    debouncedIndexUpdate(scrollTop)

    if (
      hasMore &&
      !isFetchingNextPage &&
      scrollHeight - (scrollTop + clientHeight) < SCROLL_THRESHOLD_PX
    ) {
      isControlled ? onLoadMore?.() : fetchNextPage()
    }
  }, [
    debouncedIndexUpdate,
    fetchNextPage,
    hasMore,
    isControlled,
    isFetchingNextPage,
    onLoadMore,
  ])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener("scroll", handleScroll)
    return () => el.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  return (
    <div className="video-feed-background">
      <Helmet>
        {allVideos[currentIndex + 1] && (
          <link
            rel="preload"
            as="video"
            href={allVideos[currentIndex + 1].url}
            type="video/mp4"
          />
        )}
        {allVideos[currentIndex + 2] && (
          <link
            rel="preload"
            as="video"
            href={allVideos[currentIndex + 2].url}
            type="video/mp4"
          />
        )}
        {allVideos[currentIndex + 3] && (
          <link
            rel="preload"
            as="video"
            href={allVideos[currentIndex + 3].url}
            type="video/mp4"
          />
        )}
      </Helmet>

      {isFetching && !isFetchingNextPage && <Loading />}

      {showTabs && (
        <div className="feed-tabs">
          <button
            className={selectedTab === "for-you" ? "tab active" : "tab"}
            onClick={() => {
              setSelectedTab("for-you")
              setCurrentIndex(0)
              if (containerRef.current) {
                containerRef.current.scrollTo({ top: 0, behavior: "auto" })
              }
            }}
          >
            For you
          </button>
          <button
            className={selectedTab === "following" ? "tab active" : "tab"}
            onClick={() => {
              setSelectedTab("following")
              setCurrentIndex(0)
              if (containerRef.current) {
                containerRef.current.scrollTo({ top: 0, behavior: "auto" })
              }
            }}
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

      <div className="video-feed-container-feed" ref={containerRef}>
        {allVideos.map((video) => (
          <div key={video.id} className="video-feed-slide">
            <VideoCard video={video} />
          </div>
        ))}

        {isFetchingNextPage && (
          <div className="video-feed-loading">
            <Loading />
          </div>
        )}
      </div>
    </div>
  )
}
