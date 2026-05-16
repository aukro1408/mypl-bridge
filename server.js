import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();

const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'mypl-bridge'
  });
});

app.get('/mypl/v1/search', async (req, res) => {
  try {
    const source = req.query.source || 'fanfilm4k';
    const title = req.query.title || '';

    if (!title) {
      return res.json({
        results: []
      });
    }

    let url = '';

    if (source === 'fanfilm4k') {
      url =
        'https://v12.fanfilm4k.media/index.php?do=search&subaction=search&story=' +
        encodeURIComponent(title);
    }

    console.log('SEARCH URL:', url);

    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.data;

    const $ = cheerio.load(html);

    const results = [];

    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';

      const text = $(el).text().trim();

      const img =
        $(el).find('img').attr('src') ||
        $(el).find('img').attr('data-src') ||
        '';

      if (
        href.includes('fanfilm4k') &&
        text.length > 1
      ) {
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
      results: results.slice(0, 20)
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
