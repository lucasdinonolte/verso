export const zeroPad = (num, places) => String(num).padStart(places, '0');
export const zeroPadToMatch = (num, match) =>
  zeroPad(num, String(match).length);
