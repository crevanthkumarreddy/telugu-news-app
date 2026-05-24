export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const sources = [
    {
      name: 'Eenadu',
      url: 'https://news.google.com/rss/search?q=site:eenadu.net&hl=te&gl=IN&ceid=IN:te',
    },
    {
      name: 'Andhra Jyothi',
      url: 'https://news.google.com/rss/search?q=site:andhrajyothy.com&hl=te&gl=IN&ceid=IN:te',
    },
    {
      name: 'ETV Bharat',
      url: 'https://news.google.com/rss/search?q=site:etvbharat.com+telugu&hl=te&gl=IN&ceid=IN:te',
    },
  ];

  try {
    const allNews = [];

    for (const source of sources) {
      const response = await fetch(source.url);
      const text = await response.text();

      const items = text.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (const item of items.slice(0, 10)) {
        const title =
          item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
          item.match(/<title>(.*?)<\/title>/)?.[1] ||
          '';

        const link =
          item.match(/<link>(.*?)<\/link>/)?.[1] || '';

        const pubDate =
          item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';

        const description =
          item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
          item.match(/<description>(.*?)<\/description>/)?.[1] ||
          '';

        const imgMatch = description.match(/<img[^>]+src="([^"]+)"/);
        const image = imgMatch ? imgMatch[1] : null;

        const cleanDesc = description
          .replace(/<[^>]+>/g, '')
          .trim()
          .substring(0, 200);

        if (title) {
          allNews.push({
            id: Math.random().toString(36).substr(2, 9),
            title: title
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>'),
            description: cleanDesc,
            link,
            pubDate,
            source: source.name,
            image,
          });
        }
      }
    }

    // Mix news from all sources
    allNews.sort(() => Math.random() - 0.5);

    res.status(200).json({
      news: allNews,
      total: allNews.length,
      fetched: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
