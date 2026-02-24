const PRODUCTION_ORIGIN = "https://app.onehello.io";

/**
 * Returns the canonical public origin for auth redirects.
 *
 * Why: if a user requests a magic link from a preview/staging URL, we still want
 * the email link to bring them back to the real app domain.
 */
export const getPublicAppOrigin = (): string => {
  if (typeof window === 'undefined') return PRODUCTION_ORIGIN;

  const host = window.location.hostname;

  // Preview / local environments
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('lovableproject.com') ||
    host.endsWith('lovable.app')
  ) {
    return PRODUCTION_ORIGIN;
  }

  return window.location.origin;
};

export const getAuthCallbackUrl = (): string => {
  return `${getPublicAppOrigin()}/auth/callback`;
};
