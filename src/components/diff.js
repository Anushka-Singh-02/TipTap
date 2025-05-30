// Tiptap JSON Tree Diffing Algorithm
class TiptapTreeDiff {
    constructor() {
      this.changes = [];
    }
  
    // Main diff function
    diff(oldTree, newTree) {
      this.changes = [];
      this.diffNodes(oldTree, newTree, []);
      return this.changes;
    }
  
    // Recursively diff nodes
    diffNodes(oldNode, newNode, path) {
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
  
      // Check if node types are different
      if (oldNode.type !== newNode.type) {
        this.addChange('modification', path, oldNode, newNode);
        return;
      }
  
      // Check attributes
      this.diffAttributes(oldNode.attrs, newNode.attrs, [...path, 'attrs']);
  
      // Handle text nodes specially
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
    diffTextNode(oldNode, newNode, path) {
      // Check text content
      if (oldNode.text !== newNode.text) {
        this.addChange('text-modification', path, oldNode, newNode);
      }
  
      // Check marks (bold, italic, etc.)
      const oldMarks = oldNode.marks || [];
      const newMarks = newNode.marks || [];
      
      if (!this.arraysEqual(oldMarks, newMarks)) {
        this.addChange('marks-modification', path, oldNode, newNode);
      }
    }
  
    // Diff content arrays using LCS (Longest Common Subsequence)
    diffContentArrays(oldContent, newContent, path) {
      const lcs = this.longestCommonSubsequence(oldContent, newContent);
      
      let oldIndex = 0;
      let newIndex = 0;
      let lcsIndex = 0;
  
      while (oldIndex < oldContent.length || newIndex < newContent.length) {
        // If we have more LCS elements and current elements match
        if (lcsIndex < lcs.length && 
            oldIndex < oldContent.length && 
            newIndex < newContent.length &&
            this.nodesEqual(oldContent[oldIndex], lcs[lcsIndex]) &&
            this.nodesEqual(newContent[newIndex], lcs[lcsIndex])) {
          
          // Recursively diff the matching nodes
          this.diffNodes(
            oldContent[oldIndex], 
            newContent[newIndex], 
            [...path, newIndex]
          );
          
          oldIndex++;
          newIndex++;
          lcsIndex++;
        }
        // Element exists in old but not in new (deletion)
        else if (oldIndex < oldContent.length && 
                 (lcsIndex >= lcs.length || 
                  !this.nodesEqual(oldContent[oldIndex], lcs[lcsIndex]))) {
          
          this.addChange('deletion', [...path, oldIndex], oldContent[oldIndex], null);
          oldIndex++;
        }
        // Element exists in new but not in old (addition)
        else if (newIndex < newContent.length) {
          this.addChange('addition', [...path, newIndex], null, newContent[newIndex]);
          newIndex++;
        }
      }
    }
  
    // Diff attributes
    diffAttributes(oldAttrs, newAttrs, path) {
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
  
    // Longest Common Subsequence algorithm
    longestCommonSubsequence(arr1, arr2) {
      const m = arr1.length;
      const n = arr2.length;
      const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
      // Fill the DP table
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (this.nodesEqual(arr1[i - 1], arr2[j - 1])) {
            dp[i][j] = dp[i - 1][j - 1] + 1;
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          }
        }
      }
  
      // Reconstruct the LCS
      const lcs = [];
      let i = m, j = n;
      while (i > 0 && j > 0) {
        if (this.nodesEqual(arr1[i - 1], arr2[j - 1])) {
          lcs.unshift(arr1[i - 1]);
          i--;
          j--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
          i--;
        } else {
          j--;
        }
      }
  
      return lcs;
    }
  
    // Check if two nodes are structurally equal
    nodesEqual(node1, node2) {
      if (!node1 && !node2) return true;
      if (!node1 || !node2) return false;
      
      if (node1.type !== node2.type) return false;
      
      // For text nodes, compare text and marks
      if (node1.type === 'text') {
        return node1.text === node2.text && 
               this.arraysEqual(node1.marks || [], node2.marks || []);
      }
      
      // For other nodes, compare type and basic structure
      return JSON.stringify(node1.attrs || {}) === JSON.stringify(node2.attrs || {});
    }
  
    // Helper to compare arrays
    arraysEqual(arr1, arr2) {
      if (arr1.length !== arr2.length) return false;
      return arr1.every((item, index) => 
        JSON.stringify(item) === JSON.stringify(arr2[index])
      );
    }
  
    // Add a change to the changes array
    addChange(type, path, oldValue, newValue) {
      this.changes.push({
        type,
        path: path.join('.'),
        pathArray: path,
        oldValue,
        newValue,
        timestamp: Date.now()
      });
    }
  
    // Generate HTML with highlighted changes
    generateDiffHTML(oldTree, newTree, options = {}) {
      const changes = this.diff(oldTree, newTree);
      const changeMap = this.createChangeMap(changes);
      
      const defaultOptions = {
        showUnchanged: true,    // Show unchanged content
        showDeleted: false,     // Don't show deleted content by default
        showAdditions: true,    // Show added content
        showModifications: true // Show modified content
      };
      
      const opts = { ...defaultOptions, ...options };
      
      if (opts.showDeleted) {
        // Render both old and new trees with changes highlighted
        return this.renderBothTrees(oldTree, newTree, changeMap, opts);
      } else {
        // Render only the new tree with both unchanged and changed content
        return this.nodeToHTML(newTree, [], changeMap, opts);
      }
    }
  
    // Render both old and new trees side by side or merged
    renderBothTrees(oldTree, newTree, changeMap, options) {
      const oldHTML = this.nodeToHTML(oldTree, [], changeMap, options, 'old');
      const newHTML = this.nodeToHTML(newTree, [], changeMap, options, 'new');
      
      return `
        <div style="display: flex; gap: 20px;">
          <div style="flex: 1;">
            <h3>Before</h3>
            ${oldHTML}
          </div>
          <div style="flex: 1;">
            <h3>After</h3>
            ${newHTML}
          </div>
        </div>
      `;
    }
  
    // Generate only changes HTML (no unchanged content)
    generateChangesOnlyHTML(oldTree, newTree) {
      const changes = this.diff(oldTree, newTree);
      
      return changes.map(change => {
        let html = '';
        switch (change.type) {
          case 'addition':
            html = this.nodeToHTML(change.newValue, [], new Map(), { showUnchanged: true });
            return `<div style="border-left: 3px solid #28a745; padding: 10px; margin: 5px 0; background-color: #d4edda;">
              <strong>Added:</strong> ${html}
            </div>`;
          
          case 'deletion':
            html = this.nodeToHTML(change.oldValue, [], new Map(), { showUnchanged: true });
            return `<div style="border-left: 3px solid #dc3545; padding: 10px; margin: 5px 0; background-color: #f8d7da;">
              <strong>Deleted:</strong> ${html}
            </div>`;
          
          case 'text-modification':
            return `<div style="border-left: 3px solid #ffc107; padding: 10px; margin: 5px 0; background-color: #fff3cd;">
              <strong>Changed:</strong><br>
              <del style="color: #dc3545;">${this.escapeHTML(change.oldValue?.text || '')}</del><br>
              <ins style="color: #28a745;">${this.escapeHTML(change.newValue?.text || '')}</ins>
            </div>`;
            
          default:
            return `<div style="border-left: 3px solid #6c757d; padding: 10px; margin: 5px 0; background-color: #f8f9fa;">
              <strong>${change.type}:</strong> ${change.path}
            </div>`;
        }
      }).join('');
    }
  
    // Create a map of changes by path for easy lookup
    createChangeMap(changes) {
      const map = new Map();
      changes.forEach(change => {
        map.set(change.path, change);
      });
      return map;
    }
  
    // Convert node to HTML with diff highlighting
    nodeToHTML(node, path, changeMap, options = { showUnchanged: true }, treeType = 'new') {
      if (!node) return '';
      
      const currentPath = path.join('.');
      const change = changeMap.get(currentPath);
      
      // Handle text nodes
      if (node.type === 'text') {
        let html = this.escapeHTML(node.text || '');
        
        // Apply marks (bold, italic, etc.)
        if (node.marks) {
          node.marks.forEach(mark => {
            switch (mark.type) {
              case 'bold':
                html = `<strong>${html}</strong>`;
                break;
              case 'italic':
                html = `<em>${html}</em>`;
                break;
              // Add more mark types as needed
            }
          });
        }
        
        // Apply diff highlighting
        if (change) {
          switch (change.type) {
            case 'addition':
            case 'text-modification':
              html = `<span style="background-color: #d4edda; color: #155724;">${html}</span>`;
              break;
            case 'marks-modification':
              html = `<span style="background-color: #fff3cd; color: #856404;">${html}</span>`;
              break;
          }
        }
        
        return html;
      }
  
      // Handle other node types
      let innerHTML = '';
      if (node.content) {
        innerHTML = node.content
          .map((child, index) => this.nodeToHTML(child, [...path, 'content', index], changeMap, options, treeType))
          .join('');
      }
  
      // Skip rendering unchanged nodes if option is set
      if (!options.showUnchanged && !change) {
        return innerHTML; // Return just the children without wrapper
      }
  
      // Apply diff highlighting to container
      let containerStyle = '';
      if (change) {
        switch (change.type) {
          case 'addition':
            containerStyle = 'style="border-left: 3px solid #28a745; padding-left: 10px; background-color: #d4edda;"';
            break;
          case 'deletion':
            containerStyle = 'style="border-left: 3px solid #dc3545; padding-left: 10px; background-color: #f8d7da; text-decoration: line-through;"';
            break;
          case 'modification':
            containerStyle = 'style="border-left: 3px solid #ffc107; padding-left: 10px; background-color: #fff3cd;"';
            break;
        }
      }
  
      // Generate appropriate HTML tag
      switch (node.type) {
        case 'doc':
          return `<div ${containerStyle}>${innerHTML}</div>`;
        case 'paragraph':
          // Handle empty paragraphs (empty lines)
          const paragraphContent = innerHTML || '&nbsp;'; // Non-breaking space for empty lines
          return `<p ${containerStyle}>${paragraphContent}</p>`;
        case 'heading':
          const level = node.attrs?.level || 1;
          const headingContent = innerHTML || '&nbsp;'; // Handle empty headings too
          return `<h${level} ${containerStyle}>${headingContent}</h${level}>`;
        default:
          return `<div ${containerStyle}>${innerHTML}</div>`;
      }
    }
  
    // Escape HTML characters (works in both browser and Node.js)
    escapeHTML(text) {
      if (typeof text !== 'string') return '';
      
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  }
  
  // Usage examples
  const differ = new TiptapTreeDiff();
  
  // Example trees
  const oldTree = {
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": {"textAlign": null, "level": 1},
        "content": [{"type": "text", "text": "Old Title"}]
      },
      {
        "type": "paragraph",
        "attrs": {"textAlign": null},
        "content": [{"type": "text", "marks": [{"type": "bold"}], "text": "old content"}]
      }
    ]
  };
  
  const newTree = {
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": {"textAlign": null, "level": 1},
        "content": [{"type": "text", "text": "jnjnjnnnjjnjn"}]
      },
      {
        "type": "paragraph",
        "attrs": {"textAlign": null},
        "content": [{"type": "text", "marks": [{"type": "bold"}, {"type": "italic"}], "text": "piojuihoi"}]
      }
    ]
  };
  
  // DEFAULT: Show both unchanged and changed content with highlighting
  const diffHTML = differ.generateDiffHTML(oldTree, newTree);
  
  // Other options still available:
  // const changesOnlyHTML = differ.generateChangesOnlyHTML(oldTree, newTree);
  // const sideBySideHTML = differ.generateDiffHTML(oldTree, newTree, { showDeleted: true });
  
  console.log('Default behavior: Shows both unchanged and changed content');
  console.log('Diff HTML:', diffHTML);
  
  export default TiptapTreeDiff;