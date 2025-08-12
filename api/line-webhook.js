// ユーザーからメッセージが来たら「受け取りました！」と返す最小構成
export default async function handler(req, res) {
  // LINEのWebhookはPOSTで来る。GETで叩かれても200返すだけにしておく
  if (req.method !== 'POST') return res.status(200).send('ok');

  const events = (req.body && req.body.events) || [];

  // 複数イベントが来ることがあるので map で処理
  await Promise.all(events.map(async (ev) => {
    if (ev.type === 'message' && ev.replyToken) {
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`, // ←後でVercelに入れる
        },
        body: JSON.stringify({
          replyToken: ev.replyToken,               // 1分以内に使う必要あり
          messages: [{ type: 'text', text: '受け取りました！準備中です🙌' }],
        }),
      });
    }
  }));

  return res.status(200).end(); // すぐ200を返す（重い処理は将来キューへ）
}
