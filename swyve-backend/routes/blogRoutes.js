const express = require('express');
const router = express.Router();

router.get('/posts', async (req, res) => {
  try {
    const wpRes = await fetch('https://blog.swyve.io/wp-json/wp/v2/posts?per_page=10&_embed');
    if (!wpRes.ok) {
      return res.status(wpRes.status).json({ error: 'error WordPress' });
    }
    const posts = await wpRes.json();
    res.json(posts);
  } catch (err) {
    console.error('Error i /api/blog/posts:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/posts/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const wpRes = await fetch(
      `https://blog.swyve.io/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed`
    );
    if (!wpRes.ok) {
      return res.status(wpRes.status).json({ error: 'error WordPress' });
    }
    const data = await wpRes.json();
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'not found' });
    }
    res.json(data[0]);
  } catch (err) {
    console.error('Error in /api/blog/posts/:slug:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
