import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

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

    let url = '';

    if (source === 'fanfilm4k') {
      url =
        'https://v12.fanfilm4k.media/index.php?do=search&subaction=search&story=' +
        encodeURIComponent(title);
    }

    if (source === 'uafix') {
      url =
        'https://uafix.net/?s=' +
        encodeURIComponent(title);
    }

    if (source === 'anwap') {
      url =
        'https://my.anwap.love/?do=search&subaction=search&story=' +
        encodeURIComponent(title);
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0'
      }
    });

    const $ = cheerio.load(response.data);

    const results = [];

    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();

      if (
        href &&
        text &&
        text.length > 1 &&
        href.includes('.html')
      ) {
        results.push({
          id: href,
          title: text,
          subtitle: source,
          poster: '',
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
    res.status(500).json({
      error: true,
      message: e.toString()
    });
  }
});

app.get('/mypl/v1/stream', async (req, res) => {
  try {
    res.json({
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      title: 'Test Stream',
      quality: {},
      subtitles: []
    });
  } catch (e) {
    res.status(500).json({
      error: true
    });
  }
});

app.get('/mypl/v1/seasons', async (req, res) => {
  res.json({
    seasons: []
  });
});

app.get('/mypl/v1/episodes', async (req, res) => {
  res.json({
    episodes: []
  });
});

app.listen(PORT, () => {
  console.log('Bridge started on port ' + PORT);
});
