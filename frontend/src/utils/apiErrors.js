/** Return a readable API message without ever echoing submitted secrets. */
export function getSafeApiErrorMessage(error, fallback, secrets = []) {
  const message = error.response?.data?.message;
  if (typeof message !== "string" || !message.trim()) return fallback;

  const submittedSecrets = secrets.filter((secret) => typeof secret === "string" && secret.length > 0);
  if (submittedSecrets.some((secret) => message.includes(secret))) return fallback;

  return message;
}
