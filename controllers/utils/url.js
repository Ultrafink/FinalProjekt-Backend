export function toPublicUrl(req, value) {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  const base =
    process.env.BASE_URL ||
    `${req.protocol}://${req.get("host")}`;

  return `${base}${value.startsWith("/") ? "" : "/"}${value}`;
}
