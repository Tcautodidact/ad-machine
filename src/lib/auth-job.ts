/** Jobs mogen alleen draaien met het geheime token (cron of handmatig). */
export function jobAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && req.headers.get("authorization") === `Bearer ${secret}`;
}

export const unauthorized = () => Response.json({ error: "unauthorized" }, { status: 401 });
