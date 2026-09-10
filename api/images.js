export default async function handler(req, res) {
  try {
    const r = await fetch('https://api.github.com/repos/rcpdkc/sgdb-tasarim/contents?ref=main', {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'sgdb-tasarim-vercel'
      }
    });

    if (!r.ok) {
      return res.status(r.status).json({ error: `GitHub API ${r.status}` });
    }

    const data = await r.json();
    const images = data
      .filter((x) => x.type === 'file' && /\.(png|jpe?g|webp|gif)$/i.test(x.name))
      .map((x) => ({
        name: x.name,
        download_url: x.download_url || `https://raw.githubusercontent.com/rcpdkc/sgdb-tasarim/main/${encodeURIComponent(x.name)}`
      }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
    return res.status(200).json(images);
  } catch (error) {
    return res.status(500).json({ error: 'Görseller alınamadı.' });
  }
}
