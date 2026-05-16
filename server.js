import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();

const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'mypl bridge working'
  });
});

app.get('/mypl/v1/search', async (req, res) => {
  try {
    const source = req.query.source || 'uafix';
    const title = req.query.title || '';

    if (!title) {
      return res.json({ results: [] });
    }

    let url = '';

    if (source === 'uafix') {
      url = `https://uafix.net/?s=${encodeURIComponent(title)}`;
    }

    if (!url) {
      return res.json({ results: [] });
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.data;

    const $ = cheerio.load(html);

    const results = [];

    $('.movie-item, .shortstory, article').each((i, el) => {
      const a = $(el).find('a').first();

      const href = a.attr('href') || '';

      const img =
        $(el).find('img').attr('src') ||
        $(el).find('img').attr('data-src') ||
        '';

      const text = $(el).text().trim();

      if (href && text) {
        results.push({
          id: href,
          title: text.slice(0, 120),
          subtitle: source,
          poster: img,
          serial: false,
          ref: {
            url: href
          }
        });
      }
    });

    res.json({
      results
    });
  } catch (e) {
    console.error(e);

    res.json({
      results: [],
      error: String(e)
    });
  }
});

app.listen(PORT, () => {
  console.log(`Bridge started on port ${PORT}`);
});
