export function checkMissedVariables(obj: Record<string, any>) {
  return Object.keys(obj).find((i) => obj[i] === undefined);
}
