import { generateTextDiff } from './utils/textDiff';
import { arraysEqual } from './utils/arrayUtils';
import { nodeToHTML } from './utils/nodeToHTML';
import { createMergedTree } from './utils/treeUtils';
import { Change } from './types';

class TiptapTreeDiff {
  private changes: Change[] = [];

  diff(oldTree: any, newTree: any) {
    this.changes = [];
    this.diffNodes(oldTree, newTree, []);
    return this.changes;
  }

  diffNodes(oldNode: any, newNode: any, path: string[]) {
    // Handle null/undefined cases
    if (!oldNode && !newNode) return;
    
    if (!oldNode && newNode) {
      this.addChange('addition', path, null, newNode);
      return;
    }
    
    if (oldNode && !newNode) {
      this.addChange('deletion', path, oldNode, null);
      return;
    }

    //if node types are different
    if (oldNode.type !== newNode.type) {
      this.addChange('modification', path, oldNode, newNode);
      return;
    }

    // attributes
    this.diffAttributes(oldNode.attrs, newNode.attrs, [...path, 'attrs']);

    // Handle text nodes 
    if (oldNode.type === 'text') {
      this.diffTextNode(oldNode, newNode, path);
      return;
    }

    // Handle content arrays
    if (oldNode.content || newNode.content) {
      this.diffContentArrays(
        oldNode.content || [], 
        newNode.content || [], 
        [...path, 'content']
      );
    }
  }

  // Diff text nodes with mark changes
  diffTextNode(oldNode: any, newNode: any, path: string[]) {
    // Check text content
    if (oldNode.text !== newNode.text) {
      this.addChange('text-modification', path, oldNode, newNode);
    }

    // (bold, italic, etc.)
    const oldMarks = oldNode.marks || [];
    const newMarks = newNode.marks || [];
    
    if (!arraysEqual(oldMarks, newMarks)) {
      this.addChange('marks-modification', path, oldNode, newNode);
    }
  }

  //comparing the addition and deletion of content arrays
  diffContentArrays(oldContent: any[], newContent: any[], path: string[]) {
    const maxLen = Math.max(oldContent.length, newContent.length);
    
    for (let i = 0; i < maxLen; i++) {
      const oldNode = oldContent[i];
      const newNode = newContent[i];
      
      if (!oldNode && newNode) {
        this.addChange('addition', [...path, i], null, newNode);
      } else if (oldNode && !newNode) {
        this.addChange('deletion', [...path, i], oldNode, null);
      } else if (oldNode && newNode) {
        this.diffNodes(oldNode, newNode, [...path, i]);
      }
    }
  }

  // Diff attributes
  diffAttributes(oldAttrs: any, newAttrs: any, path: string[]) {
    if (!oldAttrs && !newAttrs) return;
    
    const oldKeys = Object.keys(oldAttrs || {});
    const newKeys = Object.keys(newAttrs || {});
    const allKeys = new Set([...oldKeys, ...newKeys]);

    for (const key of allKeys) {
      const oldValue = oldAttrs?.[key];
      const newValue = newAttrs?.[key];

      if (oldValue !== newValue) {
        this.addChange('attribute-modification', [...path, key], oldValue, newValue);
      }
    }
  }

  // Add a change to the changes array
  addChange(type: string, path: string[], oldValue: any, newValue: any) {
    this.changes.push({
      type,
      path: path.join('.'),
      pathArray: path,
      oldValue,
      newValue,
      timestamp: Date.now()
    });
  }

  generateDiffHTML(oldTree: any, newTree: any) {
    const changes = this.diff(oldTree, newTree);
    const changeMap = new Map(changes.map(change => [change.path, change]));
    
    // merged tree that includes both old and new content
    const mergedTree = createMergedTree(oldTree, newTree, changeMap);
    
    return nodeToHTML(mergedTree, [], changeMap);
  }

  // Utility method to get summary of changes
  getChangesSummary() {
    const summary = {
      additions: this.changes.filter(c => c.type === 'addition').length,
      deletions: this.changes.filter(c => c.type === 'deletion').length,
      modifications: this.changes.filter(c => c.type.includes('modification')).length,
      total: this.changes.length
    };
    return summary;
  }
}

export default TiptapTreeDiff; 