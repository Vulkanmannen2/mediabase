import { NextRequest } from "next/server";

/**
 * Base URL for building redirects. Behind Coolify's Traefik proxy, the Host
 * header Next.js sees resolves to the internal container address, not the
 * public domain — so request.url alone produces broken redirects (e.g.
 * https://localhost:3000/...). AUTH_URL is already the app's canonical
 * public URL in every environment, so reuse it here instead of introducing
 * a second env var for the same value.
 */
export function baseUrl(request: NextRequest): string {
  return process.env.AUTH_URL ?? request.url;
}
