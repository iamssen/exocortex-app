export function getExist<T extends {}, K extends keyof T>(
  obj: T | undefined | null,
  ...keys: K[]
): T[K] | undefined {
  if (!obj) {
    return undefined;
  }
  const existKey = keys.find((k) => {
    const d = obj[k];
    if (Array.isArray(d)) {
      return d.length > 0;
    }
    return !!d;
  });
  return existKey ? obj[existKey] : undefined;
}
