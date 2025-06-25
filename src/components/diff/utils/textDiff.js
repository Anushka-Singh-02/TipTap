import DiffMatchPatch from 'diff-match-patch';
import { escapeHTML } from './htmlUtils';

export const generateTextDiff = (oldText, newText, marks = []) => {
  const dmp = new DiffMatchPatch();
  const diffs = dmp.diff_main(oldText || '', newText || '');
  dmp.diff_cleanupSemantic(diffs); 

  let html = '';
  diffs.forEach(([operation, text]) => {
    const escapedText = escapeHTML(text);
    
    switch (operation) {
      case 1: // DIFF_INSERT
        html += `<span style="border-radius: 3px; background-color: lightgreen; color:green;">${escapedText}</span>`;
        break;
      case -1: // DIFF_DELETE
        html += `<span style="background-color: #f8d7da; color: #721c24; text-decoration: line-through; padding: 1px 3px; border-radius: 3px; border: 1px solid #f5c6cb;">${escapedText}</span>`;
        break;
      case 0: // DIFF_EQUAL
        html += escapedText;
        break;
    }
  });

  // displaying marks(bold,italic...) after diff highlighting
  if (marks && marks.length > 0) {
    marks.forEach(mark => {
      switch (mark.type) {
        case 'bold':
          html = `<strong>${html}</strong>`;
          break;
        case 'italic':
          html = `<em>${html}</em>`;
          break;
        case 'strike':
          html = `<s>${html}</s>`;
          break;
        case 'highlight':
          html = `<mark>${html}</mark>`;
          break;
        case 'code':
          html = `<code>${html}</code>`;
          break;
      }
    });
  }

  return html;
}; 