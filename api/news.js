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

        // Extract image from description if available
        const imgMatch = description.match(/<img[^>]+src="([^"]+)"/);
        const image = imgMatch ? imgMatch[1] : null;

        // Clean description — strip all HTML tags
        const cleanDesc = description.replace(/<[^>]+>/g, '').trim();

        // Only keep description if it has real text (not just a URL or empty)
        const isUseful = cleanDesc.length > 20 && !cleanDesc.startsWith('http');
        const finalDesc = isUseful ? cleanDesc.substring(0, 200) : '';

        // Clean up title
        const cleanTitle = title
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/\s*-\s*Eenadu\s*$/, '')
          .replace(/\s*-\s*Andhra Jyothi\s*$/, '')
          .replace(/\s*-\s*ETV Bharat\s*$/, '')
          .trim();

        if (cleanTitle) {
          allNews.push({
            id: Math.random().toString(36).substr(2, 9),
            title: cleanTitle,
            description: finalDesc,
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
