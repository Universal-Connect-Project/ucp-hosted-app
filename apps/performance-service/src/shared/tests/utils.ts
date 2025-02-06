export const minutesAgo = (minutes: number): number =>
  Date.now() - minutes * 60 * 1000;
