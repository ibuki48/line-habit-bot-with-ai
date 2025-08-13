// キーワードに反応して /liff のURLを返信する版
export default async function handler(req, res) {
  // LINEのWebhookは基本POST。GETで叩かれても200を返すだけ
  if (req.method !== 'POST') return res.status(200).send('ok');

  const events = (req.body && req.body.events) || [];

  // 受信したドメインからLIFFのURLを作成（VercelならOK）
  const baseUrl = `https://${req.headers.host}`;
  const liffUrl = `${baseUrl}/liff/`; // ← 末尾スラッシュ大事！

  await Promise.all(events.map(async (ev) => {
    if (ev.type === 'message' && ev.message?.type === 'text' && ev.replyToken) {
      const text = (ev.message.text || '').trim();

      // 反応させたいキーワードをここに列挙
      const triggers = ['チェックイン', 'checkin', '/liff', 'リフ', 'りふ'];
      const wantsLiff = triggers.some(k => text.includes(k));

      const messages = wantsLiff
        ? [{ type: 'text', text: `今日のチェックインはこちら👇\n${liffUrl}` }]
        : [{ type: 'text', text: '受け取りました！準備中です🙌' }];

      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          replyToken: ev.replyToken, // 1分以内に使用
          messages
        }),
      });
    }
  }));

  return res.status(200).end();
}
