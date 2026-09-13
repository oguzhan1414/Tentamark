// Shared between generateWeeklyPack.ts (a "use server" file, which can only
// export async functions — no plain constants) and the client-side day
// picker in WeeklyPackForm.tsx, so both agree on the same ceiling without
// duplicating the magic number.
export const MAX_ITEM_COUNT = 14;
