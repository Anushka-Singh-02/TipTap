export const arraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => 
    JSON.stringify(item) === JSON.stringify(arr2[index])
  );
}; 