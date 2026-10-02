export function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || "a loved one";
}

export function isLinkToken(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
