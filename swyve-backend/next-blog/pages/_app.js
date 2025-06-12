import '../styles/blog.css';
import Head from 'next/head';
import Layout from '@/components/Layout';



export default function App({ Component, pageProps }) {
  const pageTitle =
    pageProps.pageTitle ||
    pageProps.seoTitle ||
    pageProps.post?.title?.rendered ||
    'Swyve Blog';

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Layout pageTitle={pageTitle}>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
