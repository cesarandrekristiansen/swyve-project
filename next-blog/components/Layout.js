import Head from 'next/head'
import Link from 'next/link'

export default function Layout({ children, pageTitle }) {
  return (
    <div className="app">
      <Head>
        <title>{pageTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className="header">
        <div className="header-left">
          <Link href="https://swyve.io" legacyBehavior passHref>
            <a className="logo-link">
              <img src="/logo.png" alt="Swyve" className="logo" />
            </a>
          </Link>
          <h1 className="site-title">Swyve Blog</h1>
        </div>

        <div className="header-right">
          <Link href="https://swyve.io" legacyBehavior passHref>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="external-link"
            >
              Explore the site
            </a>
          </Link>
        </div>
      </header>

      <main className="main-content">{children}</main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Swyve. All rights reserved.</p>
      </footer>
    </div>
  )
}
