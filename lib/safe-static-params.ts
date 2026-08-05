/**
 * `generateStaticParams` runs at build time, which may happen in an
 * environment with no database access (e.g. an isolated `docker build`
 * before the DB container exists). Falling back to an empty array is safe:
 * Next.js just renders those routes on-demand at request time instead of
 * pre-rendering them, since `dynamicParams` defaults to true.
 */
export async function safeStaticParams<T>(query: () => Promise<T[]>): Promise<T[]> {
  try {
    return await query();
  } catch (error) {
    console.warn(
      "[generateStaticParams] Skipping build-time pre-render — database unavailable:",
      error instanceof Error ? error.message : error
    );
    return [];
  }
}
