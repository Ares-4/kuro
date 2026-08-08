export default async function handler(req, res) {
  const hookUrl = "https://api.vercel.com/v1/integrations/deploy/prj_V6XdGd2512IGmqHSYTHS9yuPRiB5/k9wC7ssZl7";
  const result = await fetch(hookUrl, { method: "POST" });
  res.status(result.ok ? 200 : 502).json({ triggered: result.ok });
}
