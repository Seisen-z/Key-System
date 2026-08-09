export default async function handler(req, res) {
  try {
    const r = await fetch(
      'https://api.github.com/repos/Seisen-z/Reiya-Account-Manager/releases/latest',
      { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'ReiyaWebsite' } }
    )
    if (!r.ok) throw new Error('api error')
    const data = await r.json()
    const exe = data.assets?.find(a => a.name.endsWith('.exe'))
    if (exe?.browser_download_url) {
      res.writeHead(302, { Location: exe.browser_download_url })
      res.end()
    } else {
      // No .exe asset yet — send to the releases page so user can download manually
      res.writeHead(302, { Location: 'https://github.com/Seisen-z/Reiya-Account-Manager/releases/latest' })
      res.end()
    }
  } catch {
    res.writeHead(302, { Location: 'https://github.com/Seisen-z/Reiya-Account-Manager/releases/latest' })
    res.end()
  }
}
