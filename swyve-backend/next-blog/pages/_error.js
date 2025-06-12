function Error({ statusCode }) {
    return (
      <main style={{ padding: '4rem', textAlign: 'center' }}>
        <h1>{statusCode || 500} – Something Went Wrong</h1>
        <p>Please try again later.</p>
      </main>
    );
  }
  
  Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
  };
  
  export default Error;
  