import Link from 'next/link'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <>
      <Head>
        <title>Welcome to Swyve</title>
      </Head>
      <main className={styles.container}>
        <h1 className={styles.title}>Welcome to Swyve</h1>
        <div className={styles.grid}>
          <Link href="/blog" className={styles.card}>
            <h2>Blog &rarr;</h2>
            <p>Read our latest articles</p>
          </Link>
          {/*Her kan dere legge til linker til felre sider som FAQ osv*/}
        </div>
      </main>
    </>
  )
}
