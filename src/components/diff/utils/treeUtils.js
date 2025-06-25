export const createMergedTree = (oldNode, newNode, changeMap, path = []) => {
  // If only new node exists, return it (addition)
  if (!oldNode && newNode) {
    return newNode;
  }
  
  // If only old node exists, return it marked for deletion
  if (oldNode && !newNode) {
    return { ...oldNode, _isDeleted: true };
  }
  
  // If neither exists, return null
  if (!oldNode && !newNode) {
    return null;
  }
  
  // If both exist but types differ, show both (old as deleted, new as added)
  if (oldNode.type !== newNode.type) {
    return {
      type: 'diff_container',
      content: [
        { ...oldNode, _isDeleted: true },
        { ...newNode, _isAdded: true }
      ]
    };
  }
  
  // For same types, merge content
  const merged = { ...newNode };
  
  // Handle content arrays specially
  if (oldNode.content || newNode.content) {
    merged.content = mergeContentArrays(
      oldNode.content || [], 
      newNode.content || [], 
      changeMap,
      [...path, 'content']
    );
  }
  
  return merged;
};

export const mergeContentArrays = (oldContent, newContent, changeMap, path) => {
  const result = [];
  const maxLen = Math.max(oldContent.length, newContent.length);
  
  for (let i = 0; i < maxLen; i++) {
    const oldNode = oldContent[i];
    const newNode = newContent[i];
    const currentPath = [...path, i];
    
    if (!oldNode && newNode) {
      // Addition
      result.push({ ...newNode, _isAdded: true });
    } else if (oldNode && !newNode) {
      // Deletion - preserve the old node for display
      result.push({ ...oldNode, _isDeleted: true });
    } else if (oldNode && newNode) {
      // Both exist - recursively merge
      const merged = createMergedTree(oldNode, newNode, changeMap, currentPath);
      if (merged) result.push(merged);
    }
  }
  
  return result;
}; 