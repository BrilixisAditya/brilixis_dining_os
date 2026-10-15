/**
 * Reads the table QR token without coupling the customer page to a particular
 * URL shape. Current QR links may use ?qr_token=... or /menu/<token>.
 */
export function getTableQrToken(url: string = window.location.href): string | null {
  const parsed = new URL(url);

  const queryToken =
    parsed.searchParams.get('qr_token') ??
    parsed.searchParams.get('table_qr_token') ??
    parsed.searchParams.get('token');

  if (queryToken?.trim()) return queryToken.trim();

  const segments = parsed.pathname.split('/').filter(Boolean);
  const menuIndex = segments.findIndex((segment) => segment.toLowerCase() === 'menu');
  if (menuIndex >= 0 && segments[menuIndex + 1]) {
    return decodeURIComponent(segments[menuIndex + 1]);
  }

  return null;
}
