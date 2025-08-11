// 何が来ても 200 を返すだけ（最小）
// GET/POSTどちらでもOKにしておく
export default async function handler(req, res) {
  return res.status(200).json({ ok: true });
}
