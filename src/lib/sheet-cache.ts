import { revalidateTag, unstable_cache } from 'next/cache';

import { SHEET_ID } from '@/lib/sheets-constants';

/** Fallback TTL if a tag is never invalidated (writes go through the portal). */
export const SHEET_CACHE_MAX_AGE_SECONDS = 60 * 60;

export function sheetCacheTag(sheetName: string) {
  return `sheet:${sheetName}`;
}

export async function invalidateSheetCache(sheetName: string) {
  revalidateTag(sheetCacheTag(sheetName), 'max');
}

export function cachedSheetData<T>(
  sheetName: string,
  cacheKey: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const sheetKey = SHEET_ID ?? 'missing-sheet-id';
  const cached = unstable_cache(fetcher, ['sheet-cache', sheetKey, sheetName, cacheKey], {
    tags: [sheetCacheTag(sheetName)],
    revalidate: SHEET_CACHE_MAX_AGE_SECONDS,
  });
  return cached();
}
