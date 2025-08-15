// LIFF から { userId, status, ts? } を受け取り、LINEに返信 + n8n へ転送
export default async function handler(req, res) {
  // GET などで叩かれた時も 200 を返す（死活確認用）
  if (req.method !== 'POST') return res.status(200).send('ok');

  try {
    const { userId, status, ts } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'no userId' });

    // 1) 送信者へ軽いフィードバック
    const text =
      status === 'done'
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

    // 2) n8n へ転送（記録用）— 環境変数に URL があれば送る
    const url = process.env.N8N_CHECKIN_WEBHOOK_URL;
    if (url) {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ts: ts || new Date().toISOString(),
          userId,
          status: status ?? 'done',
          source: 'liff',
        }),
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('checkin error', e);
    return res.status(500).json({ error: 'internal' });
  }
}
