// LIFFから { userId, status, ts } を受け取り、プッシュで返信する
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('ok');

  try {
    const { userId, status } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'no userId' });

    const text = status === 'done'
      ? 'チェックインありがとう！今日も一歩前進👏'
      : 'OK、今日はリカバリーに当てよう。明日また一緒に！';

    await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ to: userId, messages: [{ type: 'text', text }] }),
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'internal' });
  }
}
