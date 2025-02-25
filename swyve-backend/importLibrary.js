const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');
require('dotenv').config();
const path = require('path');

// Set up PostgreSQL pool using your Supabase connection string
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_CONNECTION_STRING,
});

// Define the custom headers based on your CSV structure.
const headers = [
  'video_url_iframe', // Column 1: contains an <iframe> tag with the src attribute
  'thumbnail_main',   // Column 2: main thumbnail URL
  'thumbnails_extra', // Column 3: extra thumbnails (ignored)
  'title',            // Column 4: video title
  'tags1',            // Column 5: first set of tags
  'tags2',            // Column 6: second set of tags
  'creator',          // Column 7: creator (ignored)
  'duration_seconds', // Column 8: duration in seconds
  'code1',            // Column 9: code (ignored)
  'code2',            // Column 10: code (ignored)
  'code3',            // Column 11: code (ignored)
  'thumbnail_extra',  // Column 12: extra thumbnail (ignored)
  'thumbnails_extra2' // Column 13: extra thumbnails (ignored)
];

let count = 0;
const limit = 2; // For testing, process only the first 2 rows
const results = [];

// Create a stream and assign it to a variable so we can control it later.
const stream = fs.createReadStream('C:/Users/tuvae/Downloads/pornhub.com-db/pornhub.com-db.csv')
  .pipe(csv({
    headers,         // use our custom headers
    separator: '|',
    quote: ''        // disable quote processing
  }));

stream.on('data', (row) => {
  if (count < limit) {
    console.log(row); // Log the parsed row

    // 1. Extract video URL from the iframe in column 1.
    const iframeHtml = row['video_url_iframe'] || '';
    const urlMatch = iframeHtml.match(/src="([^"]+)"/);
    const videoUrl = urlMatch ? urlMatch[1] : null;
    if (!videoUrl) {
      console.warn(`Row ${count} missing video URL; skipping this row.`);
      count++;
      return;
    }

    // 2. Get main thumbnail URL from column 2.
    const thumbnail = (row['thumbnail_main'] || '').replace(/^\|/, '').trim();

    // 3. Get title from column 4.
    const title = (row['title'] || '').replace(/^\|/, '').trim();

    // 4. Combine tags from columns 5 and 6.
    const tags1 = (row['tags1'] || '').replace(/^\|/, '').trim();
    const tags2 = (row['tags2'] || '').replace(/^\|/, '').trim();
    const tags = [tags1, tags2].filter(Boolean).join(';');

    // 5. Get duration from column 8.
    const duration = (row['duration_seconds'] || '').replace(/^\|/, '').trim();

    // Build our record object.
    results.push({
      title,
      url: videoUrl,
      thumbnail,
      duration,
      tags,
      embed_code: '',  // Ignoring embed codes for now.
      source: 'library'
    });
    count++;

    // If we've reached the limit, destroy the stream to stop reading further rows.
    if (count === limit) {
      stream.destroy();
    }
  }
});

// Use the "close" event which will fire when the stream is destroyed.
stream.on('close', async () => {
  console.log(`Importing ${results.length} library videos...`);
  for (const row of results) {
    try {
      await pool.query(
        `INSERT INTO videos (title, url, thumbnail, duration, tags, embed_code, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [row.title, row.url, row.thumbnail, row.duration, row.tags, row.embed_code, row.source]
      );
    } catch (err) {
      console.error('Error inserting row:', err.message);
    }
  }
  console.log('Import complete.');
  pool.end();
});

stream.on('error', (err) => {
  console.error('Error reading CSV file:', err);
});
