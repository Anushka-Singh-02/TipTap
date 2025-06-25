export const createChangeMap = (changes) => {
  const map = new Map();
  changes.forEach(change => {
    map.set(change.path, change);
  });
  return map;
}; 