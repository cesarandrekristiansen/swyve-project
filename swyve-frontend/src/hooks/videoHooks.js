import { useState, useEffect, useRef } from 'react'

export function useVideos({ type = 'all', userId = null } = {}) {
  const LIMIT = 5

  const [pageIndices, setPageIndices] = useState([])  
  const [nextIndexPos, setNextIndexPos] = useState(0)  
  const [allPages, setAllPages] = useState([])  
  const [totalCount, setTotalCount] = useState(null)    
  const [followPages, setFollowPages] = useState([])
  const [followOffset, setFollowOffset] = useState(0)

  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  const prevType = useRef(type)
  const prevUserId = useRef(userId)

  useEffect(() => {
    if (prevType.current !== type || prevUserId.current !== userId) {
      prevType.current = type
      prevUserId.current = userId

      setPageIndices([])
      setNextIndexPos(0)
      setAllPages([])
      setTotalCount(null)

      setFollowPages([])
      setFollowOffset(0)

      setHasMore(false)
    }
  }, [type, userId])

  useEffect(() => {
    if (type !== 'all') return

    let canceled = false
    setLoading(true)

    const base = process.env.REACT_APP_BASE_URL

    async function fetchCount() {
      try {
        const res = await fetch(`${base}/api/videos/count`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Kunne ikke hente antall videoer')
        const json = await res.json()
        if (canceled) return

        const count = json.count
        setTotalCount(count)
        const totalPages = Math.ceil(count / LIMIT)
        const indices = Array.from({ length: totalPages }, (_, i) => i)
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[indices[i], indices[j]] = [indices[j], indices[i]]
        }
        setPageIndices(indices)
        setNextIndexPos(0)
        setHasMore(totalPages > 0)
      } catch (err) {
        console.error(err)
      } finally {
        if (!canceled) setLoading(false)
      }
    }

    fetchCount()
    return () => {
      canceled = true
    }
  }, [type])

  useEffect(() => {
    if (type !== 'all') return
    if (loading) return
    if (pageIndices.length === 0) return

    let canceled = false
    setLoading(true)

    const base = process.env.REACT_APP_BASE_URL
    const pageNum = pageIndices[0]
    const offset = pageNum * LIMIT
    const params = new URLSearchParams({
      limit: LIMIT.toString(),
      offset: offset.toString(),
    })
    const url = `${base}/api/videos?${params}`

    fetch(url, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Kunne ikke hente videoer')
        return res.json()
      })
      .then((data) => {
        if (canceled) return
        if (Array.isArray(data) && data.length > 0) {
          setAllPages([data])
          setHasMore(data.length === LIMIT && pageIndices.length > 1)
        } else {
          setHasMore(false)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!canceled) setLoading(false)
      })

    return () => {
      canceled = true
    }
  }, [type, pageIndices])

  useEffect(() => {
    if (type !== 'following') return

    let canceled = false
    setLoading(true)

    const base = process.env.REACT_APP_BASE_URL
    const params = new URLSearchParams({
      limit: LIMIT.toString(),
      offset: '0',
    })
    const url = `${base}/api/videos/following?${params}`

    fetch(url, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Kunne ikke hente videoer')
        return res.json()
      })
      .then((data) => {
        if (canceled) return
        if (Array.isArray(data) && data.length > 0) {
          setFollowPages([data])
          setFollowOffset(data.length)
          setHasMore(data.length === LIMIT)
        } else {
          setHasMore(false)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!canceled) setLoading(false)
      })

    return () => {
      canceled = true
    }
  }, [type])

  useEffect(() => {
    if (type !== 'user' || !userId) return

    let canceled = false
    setLoading(true)

    const base = process.env.REACT_APP_BASE_URL
    const params = new URLSearchParams({
      limit: LIMIT.toString(),
      offset: '0',
    })
    const url = `${base}/api/users/${userId}/videos?${params}`

    fetch(url, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Kunne ikke hente videoer')
        return res.json()
      })
      .then((data) => {
        if (canceled) return
        if (Array.isArray(data) && data.length > 0) {
          setFollowPages([data])
          setFollowOffset(data.length)
          setHasMore(data.length === LIMIT)
        } else {
          setHasMore(false)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!canceled) setLoading(false)
      })

    return () => {
      canceled = true
    }
  }, [type, userId])

  const fetchNextPage = () => {
    if (loading) return

    if (type === 'all') {
      const nextPos = nextIndexPos + 1
      if (nextPos < pageIndices.length) {
        setNextIndexPos(nextPos)
        setHasMore(nextPos + 1 < pageIndices.length)
        setLoading(true)

        const base = process.env.REACT_APP_BASE_URL
        const pageNum = pageIndices[nextPos]
        const offset = pageNum * LIMIT
        const params = new URLSearchParams({
          limit: LIMIT.toString(),
          offset: offset.toString(),
        })
        const url = `${base}/api/videos?${params}`

        fetch(url, { credentials: 'include' })
          .then((res) => {
            if (!res.ok) throw new Error('Kunne ikke hente videoer')
            return res.json()
          })
          .then((data) => {
            setAllPages((prev) => [...prev, data])
          })
          .catch(() => {})
          .finally(() => setLoading(false))
      } else {
        setHasMore(false)
      }
    } else {
      if (!hasMore) return
      setLoading(true)

      const base = process.env.REACT_APP_BASE_URL
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: followOffset.toString(),
      })
      const url =
        type === 'following'
          ? `${base}/api/videos/following?${params}`
          : `${base}/api/users/${userId}/videos?${params}`

      fetch(url, { credentials: 'include' })
        .then((res) => {
          if (!res.ok) throw new Error('Kunne ikke hente videoer')
          return res.json()
        })
        .then((data) => {
          setFollowPages((prev) => [...prev, data])
          setFollowOffset((prev) => prev + data.length)
          setHasMore(data.length === LIMIT)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }

  let dataPages = []
  if (type === 'all') {
    dataPages = allPages
  } else {
    dataPages = followPages
  }

  return {
    data: { pages: dataPages },
    fetchNextPage,
    isFetching: loading,
    isFetchingNextPage: loading,
    hasNextPage: hasMore,
  }
}
