/**
 * Returns a safe callback URL to redirect to after login.
 * If the provided callback URL is not safe, it returns the root path ('/').
 * 
 * @param callbackUrl - The callback URL to validate.
 * @returns A safe callback URL or the root path ('/').
 */
export function getSafeCallbackUrl(callbackUrl: string | null | undefined): string {
  if (!callbackUrl) return '/'

  if (!callbackUrl.startsWith('/') || callbackUrl.startsWith('//')) {
    return '/'
  }

  return callbackUrl
}
