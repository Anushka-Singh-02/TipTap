import { escapeHTML } from './htmlUtils';
import { generateTextDiff } from './textDiff';

export const nodeToHTML = (node, path, changeMap) => {
  if (!node) return '';
  
  const currentPath = path.join('.');
  const change = changeMap.get(currentPath);
  
  if (node.type === 'diff_container') {
    return node.content
      .map((child, index) => nodeToHTML(child, [...path, 'content', index], changeMap))
      .join('');
  }
  
  // Handle text nodes
  if (node.type === 'text') {
    let html = escapeHTML(node.text || '');
    
    // Check if this is a text modification and use diff-match-patch
    if (change && change.type === 'text-modification' && change.oldValue && change.newValue) {
      console.log('Using generateTextDiff for:', change.oldValue.text, '->', change.newValue.text);
      html = generateTextDiff(
        change.oldValue.text || '', 
        change.newValue.text || '', 
        node.marks
      );
    } else {
      // Apply marks (bold, italic, etc.) for non-modified text 
      if (node.marks) {
        node.marks.forEach(mark => {
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
      
      // Apply diff highlighting for non-text-modification cases
      if (node._isDeleted) {
        html = `<span style="background-color: #f8d7da; color: #721c24; text-decoration: line-through; padding: 1px 3px; border-radius: 3px; border: 1px solid #f5c6cb;">${html}</span>`;
      } else if (node._isAdded || (change && change.type === 'addition')) {
        html = `<span style="padding: 1px 3px; border-radius: 3px; background-color: lightgreen; color:green;">${html}</span>`;
      } else if (change && change.type === 'marks-modification') {
        html = `<span style="background-color: #fff3cd; color: #856404; padding: 1px 3px; border-radius: 3px; border: 1px solid #ffeaa7;">${html}</span>`;
      }
    }
    
    return html;
  }

  // Handle other node types
  let innerHTML = '';
  if (node.content) {
    innerHTML = node.content
      .map((child, index) => nodeToHTML(child, [...path, 'content', index], changeMap))
      .join('');
  }

  // Check for alignment attribute changes
  const alignmentChange = changeMap.get(`${currentPath}.attrs.textAlign`);
  let alignmentStyle = '';
  
  if (alignmentChange) {
    const newAlign = alignmentChange.newValue || 'left';
    alignmentStyle = `text-align: ${newAlign};`;
  } else if (node.attrs && node.attrs.textAlign) {
    alignmentStyle = `text-align: ${node.attrs.textAlign};`;
  }

  // Apply diff highlighting to container
  let containerStyle = alignmentStyle;
  if (node._isDeleted) {
    containerStyle += 'border-left: 4px solid #dc3545; padding-left: 12px; margin: 8px 0; background-color: rgba(248, 215, 218, 0.2); opacity: 0.8; border-radius: 4px; text-decoration: line-through;';
  } else if (node._isAdded || (change && change.type === 'addition')) {
    containerStyle += 'margin: 8px 0; background-color: lightgreen; color:green;';
  } else if (change) {
    switch (change.type) {
      case 'modification':
        containerStyle += 'border-left: 4px solid #ffc107; margin: 8px 0; background-color: rgba(255, 243, 205, 0.2); border-radius: 4px;';
        break;
    }
  }
  
  const styleAttr = containerStyle ? `style="${containerStyle}"` : '';

  // Generate appropriate HTML tag
  switch (node.type) {
    case 'doc':
      return `<div ${styleAttr}>${innerHTML}</div>`;
    case 'paragraph':
      return `<p ${styleAttr}>${innerHTML || '<br>'}</p>`;
    case 'heading':
      const level = node.attrs?.level || 1;
      return `<h${level} ${styleAttr}>${innerHTML}</h${level}>`;
    case 'bulletList':
      return `<ul ${styleAttr} style="list-style-type: disc; padding-left: 20px; ${alignmentStyle}">${innerHTML}</ul>`;
    case 'orderedList':
      return `<ol ${styleAttr} style="list-style-type: decimal; padding-left: 20px; ${alignmentStyle}">${innerHTML}</ol>`;
    case 'listItem':
      return `<li ${styleAttr}>${innerHTML}</li>`;
    case 'blockquote':
      return `<blockquote ${styleAttr} style="border-left: 2px solid #ccc; padding-left: 16px; margin: 16px 0; font-style: italic; ${alignmentStyle}">${innerHTML}</blockquote>`;
    case 'codeBlock':
      return `<pre ${styleAttr} style="background-color: #f8f9fa; padding: 12px; border-radius: 4px; border: 1px solid #e9ecef; ${alignmentStyle}"><code>${innerHTML}</code></pre>`;
    case 'hardBreak':
      return '<br>';
    default:
      return `<div ${styleAttr}>${innerHTML}</div>`;
  }
}; 