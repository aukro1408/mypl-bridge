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
    const title = req.query.title || '';

    const url =
      'https://uaflix.net/?s=' +
      encodeURIComponent(title);

    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0'
      }
    });

    const $ = cheerio.load(response.data);

    let results = [];

    $('article').each((i, el) => {
      const a = $(el).find('a').first();

      const href = a.attr('href') || '';
      const text = a.text().trim();

      const img =
        $(el).find('img').attr('src') || '';

      if (href && text) {
        results.push({
          id: href,
          title: text,
          poster: img,
          subtitle: 'UAFlix',
          serial: false,
          ref: {
            link: href
          }
        });
      }
    });

    res.json({
      results
    });
  } catch (e) {
    res.status(500).json({
      error: e.toString()
    });
  }
});

app.listen(PORT, () => {
  console.log('Bridge started on port ' + PORT);
});
