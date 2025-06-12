import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';

const POSTS_PER_PAGE = 10;

export async function getStaticProps() {
    let posts = [];
    try {
      const countRes = await fetch(
        `${process.env.NEXT_PUBLIC_WP_API}/posts?per_page=1`
      );
      const totalCount = parseInt(
        countRes.headers.get('X-WP-Total') || '0',
        10
      );
  
      const postsRes = await fetch(
        `${process.env.NEXT_PUBLIC_WP_API}/posts?per_page=${totalCount}&_embed`
      );
      posts = await postsRes.json();
    } catch (err) {
      console.error('Error fetching posts for index:', err);
      return {
        props: { posts: [] },
        revalidate: 60,
      };
    }
  
    return {
      props: { posts },
      revalidate: 60,
    };
  }
  

export default function BlogIndex({ posts }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const page = parseInt(router.query.p) || 1;
  const canonicalUrl = page > 1 ? `/blog?p=${page}` : '/blog';

  const allTags = useMemo(() => {
    const tagMap = new Map();
    posts.forEach((post) => {
      const tags = post._embedded?.['wp:term']?.[1] || [];
      tags.forEach((tag) => tagMap.set(tag.id, tag.name));
    });
    return Array.from(tagMap, ([id, name]) => ({ id, name }));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const title = post.title.rendered.toLowerCase();
      const matchesTitle = title.includes(searchQuery.toLowerCase());
      const tags = post._embedded?.['wp:term']?.[1] || [];
      const matchesTag = selectedTag
        ? tags.some((tag) => tag.id === parseInt(selectedTag, 10))
        : true;
      return matchesTitle && matchesTag;
    });
  }, [posts, searchQuery, selectedTag]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (page - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE
  );

  return (
    <>
      <Head>
        <title>Swyve Blog</title>
        <meta
          name="description"
          content="Swyve blog: search and filter posts"
        />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div className="intro-section">
        <h1>Welcome to the Swyve Blog</h1>
        <p className="intro-text">
          Discover the latest articles, insights, and updates from our team.
          Use the search and tag filters below to find content that matters to you.
        </p>
      </div>

      <div className="search-section">
        <h3 className="search-title">Search posts or filter by tag</h3>
        <div className="filter-controls">
          <input
            type="text"
            className="search-input"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="search-select"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="">All tags</option>
            {allTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ul className="blog-list">
        <h2 className="list-heading">Our latest posts</h2>
        {paginatedPosts.map((post) => {
          const featured =
            post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
          const tags = post._embedded?.['wp:term']?.[1] || [];
          return (
            <li className="blog-item" key={post.id}>
              <div className="blog-item-content">
                <h2>
                  <Link href={`/blog/${post.slug}`} className="item-link">
                    {post.title.rendered}
                  </Link>
                </h2>
                <p className="item-date">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <div
                  className="item-excerpt"
                  dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                />

                {tags.length > 0 && (
                  <ul className="tag-list">
                    {tags.map((tag) => (
                      <li className="tag" key={tag.id}>
                        {tag.name}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="read-more">
                  <Link href={`/blog/${post.slug}`}>Read more →</Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="pagination">
        {page > 1 && (
          <button onClick={() => router.push(`/blog?p=${page - 1}`)}>
            ◀ Previous
          </button>
        )}
        {page < totalPages && (
          <button onClick={() => router.push(`/blog?p=${page + 1}`)}>
            Next ▶
          </button>
        )}
      </div>
    </>
  );
}
