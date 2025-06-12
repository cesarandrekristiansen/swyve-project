import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

export async function getStaticPaths() {
  let posts = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_WP_API}/posts?per_page=100`
    );
    posts = await res.json();
  } catch (err) {
    console.error('Error fetching posts for paths:', err);
  }
  const paths = posts.map((p) => ({ params: { slug: p.slug } }));
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const slug = params.slug;
  let postData = [];
  try {
    const postRes = await fetch(
      `${process.env.NEXT_PUBLIC_WP_API}/posts?slug=${slug}&_embed`
    );
    postData = await postRes.json();
  } catch (err) {
    console.error(`Error fetching post for slug ${slug}:`, err);
    return { notFound: true };
  }
  if (!postData.length) {
    return { notFound: true };
  }
  const post = postData[0];

  let related = [];
  try {
    const relatedRes = await fetch(
      `${process.env.NEXT_PUBLIC_WP_API}/posts?per_page=6&_embed`
    );
    related = await relatedRes.json();
    related = related.filter((p) => p.slug !== slug).slice(0, 5);
  } catch (err) {
    console.error(`Error fetching related posts for slug ${slug}:`, err);
  }

  const yoast = post.yoast_head_json || {};
  const tags = post._embedded?.['wp:term']?.[1] || [];
  const keywords = tags.map((t) => t.name).join(', ');

  return {
    props: {
      post,
      related,
      seoTitle: yoast.title || post.title.rendered,
      metaDescription:
        yoast.description ||
        post.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0, 155),
      metaKeywords: keywords,
    },
    revalidate: 60,
  };
}

export default function BlogPost({
  post,
  related,
  seoTitle,
  metaDescription,
  metaKeywords,
}) {
  const { title, content, date, _embedded } = post;
  const featured = _embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
  const tags = _embedded?.['wp:term']?.[1] || [];

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={metaKeywords} />
        <link rel="canonical" href={`/blog/${post.slug}`} />
      </Head>

      <article className="blog-item">
        <div className="blog-item-content">
          <h1
            className="post-title"
            dangerouslySetInnerHTML={{ __html: title.rendered }}
          />
          <p className="post-date">
            Published on{' '}
            {new Date(date).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

          {featured && (
            <div className="post-image">
              <Image
                src={featured}
                alt=""
                fill
                className="thumbnail-image"
              />
            </div>
          )}

          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: content.rendered }}
          />

          {related.length > 0 && (
            <>
              <h2 className="related-heading">Related Posts</h2>
              <ul className="related-list">
                {related.map((rel) => (
                  <li className="related-item" key={rel.id}>
                    <Link
                      href={`/blog/${rel.slug}`}
                      className="related-item-link"
                    >
                      <h3
                        dangerouslySetInnerHTML={{
                          __html: rel.title.rendered,
                        }}
                      />
                      <p className="related-date">
                        {new Date(rel.date).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {tags.length > 0 && (
            <ul className="tag-list">
              {tags.map((tag) => (
                <li className="tag" key={tag.id}>
                  {tag.name}
                </li>
              ))}
            </ul>
          )}

          <p className="back-link">
            <Link href="/blog" className="external-link">
              ← Back to Blog
            </Link>
          </p>
        </div>
      </article>
    </>
  );
}
