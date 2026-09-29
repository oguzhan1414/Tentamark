export function hasExactOwnedIds(requestedIds: string[], ownedIds: string[]): boolean {
  if (requestedIds.length !== ownedIds.length) return false;
  const owned = new Set(ownedIds);
  return requestedIds.every((id) => owned.has(id));
}
