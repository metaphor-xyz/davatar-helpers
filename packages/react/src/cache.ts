// 24 hour TTL
const DEFAULT_CACHE_TTL = 60 * 60 * 24 * 1000;

export type DavatarCache = {
  [key: string]: { url: string; expiresAt: string };
};

const getCache = (): DavatarCache => {
  const cache = window.localStorage.getItem('davatar/cache');
  if (!cache) {
    window.localStorage.setItem('davatar/cache', '{}');
    return {};
  }

  return JSON.parse(cache);
};

const saveCache = (cache: DavatarCache) => window.localStorage.setItem('davatar/cache', JSON.stringify(cache));

export const storeCachedURI = (address: string, resolvedUrl: string, ttl?: number) => {
  const cache = getCache();
  const normalizedAddress = address.toLowerCase();
  const item = cache[normalizedAddress];

  if (!item || new Date(item.expiresAt) > new Date()) {
    const expireDate = new Date(new Date().getTime() + (ttl || DEFAULT_CACHE_TTL));

    cache[normalizedAddress] = { url: resolvedUrl, expiresAt: expireDate.toString() };
    saveCache(cache);
  }
};

/**
 * Get cached resolved url from local storage
 *
 * @param key - an ethereum address or an avatar URI
 */
export const getCachedUrl = (key: string) => {
  const cache = getCache();
  const normalizedKey = key.toLowerCase();
  const item = cache[normalizedKey];

  if (item) {
    if (new Date(item.expiresAt) > new Date()) {
      return item.url;
    }
  }

  return null;
};
