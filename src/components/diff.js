export const createHTMLDiff = (oldHtml, newHtml) => {
    // Simple HTML-aware diff that preserves tags
    const diffHTML = (text1, text2) => {
      const words1 = tokenizeHTML(text1);
      const words2 = tokenizeHTML(text2);
      
      const diff = computeDiff(words1, words2);
      return renderDiff(diff);
    };

    const tokenizeHTML = (html) => {
      // Split HTML into tokens (tags, words, whitespace)
      const tokens = [];
      const regex = /(<[^>]*>)|([^\s<]+)|(\s+)/g;
      let match;
      
      while ((match = regex.exec(html)) !== null) {
        if (match[1]) {
          // HTML tag
          tokens.push({ type: 'tag', value: match[1] });
        } else if (match[2]) {
          // Word
          tokens.push({ type: 'word', value: match[2] });
        } else if (match[3]) {
          // Whitespace
          tokens.push({ type: 'space', value: match[3] });
        }
      }
      
      return tokens;
    };

    const computeDiff = (tokens1, tokens2) => {
      const dp = Array(tokens1.length + 1).fill(null).map(() => 
        Array(tokens2.length + 1).fill(0)
      );

      // Fill DP table
      for (let i = 1; i <= tokens1.length; i++) {
        for (let j = 1; j <= tokens2.length; j++) {
          if (tokensEqual(tokens1[i - 1], tokens2[j - 1])) {
            dp[i][j] = dp[i - 1][j - 1] + 1;
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          }
        }
      }

      // Backtrack to create diff
      const diff = [];
      let i = tokens1.length, j = tokens2.length;

      while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && tokensEqual(tokens1[i - 1], tokens2[j - 1])) {
          diff.unshift({ type: 'equal', token: tokens1[i - 1] });
          i--;
          j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
          diff.unshift({ type: 'insert', token: tokens2[j - 1] });
          j--;
        } else if (i > 0) {
          diff.unshift({ type: 'delete', token: tokens1[i - 1] });
          i--;
        }
      }

      return diff;
    };

    const tokensEqual = (token1, token2) => {
      return token1.type === token2.type && token1.value === token2.value;
    };

    const renderDiff = (diff) => {
      let result = '';
      let currentDeletes = [];
      let currentInserts = [];

      const flushChanges = () => {
        if (currentDeletes.length > 0) {
          result += `<span class="diff-delete">${currentDeletes.map(d => d.token.value).join('')}</span>`;
          currentDeletes = [];
        }
        if (currentInserts.length > 0) {
          result += `<span class="diff-insert">${currentInserts.map(i => i.token.value).join('')}</span>`;
          currentInserts = [];
        }
      };

      diff.forEach(item => {
        if (item.type === 'equal') {
          flushChanges();
          result += item.token.value;
        } else if (item.type === 'delete') {
          currentDeletes.push(item);
        } else if (item.type === 'insert') {
          currentInserts.push(item);
        }
      });

      flushChanges();
      return result;
    };

    return diffHTML(oldHtml, newHtml);
  };


  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const resetToDefaults = () => {
    setOldHTML(`<h1>Welcome to Our Blog</h1>
<p>This is the <strong>original</strong> content of our blog post. It contains some <em>formatted text</em> and will be modified.</p>
<p>Here's a paragraph that will remain unchanged.</p>
<h2>Features</h2>
<ul>
  <li>Rich text editing</li>
  <li>Real-time collaboration</li>
  <li>Export functionality</li>
</ul>
<p>The end of the original content.</p>`);

    setNewHTML(`<h1>Welcome to Our Amazing Blog</h1>
<p>This is the <strong>updated</strong> content of our blog post. It contains some <em>beautifully formatted text</em> and has been significantly improved.</p>
<p>Here's a paragraph that will remain unchanged.</p>
<h2>Enhanced Features</h2>
<ul>
  <li>Advanced rich text editing</li>
  <li>Real-time collaboration</li>
  <li>Multiple export formats</li>
  <li>Version control integration</li>
</ul>
<p>Additional content has been added here with more details.</p>
<p>The end of the enhanced content.</p>`);
  };

  // Custom styles for diff rendering
export  const diffStyles = `
    .diff-insert {
      background-color: #d4edda;
      color: #155724;
      text-decoration: none;
      padding: 2px 4px;
      border-radius: 3px;
      border-left: 3px solid #28a745;
      margin: 0 1px;
      display: inline;
    }
    
    .diff-delete {
      background-color: #f8d7da;
      color: #721c24;
      text-decoration: line-through;
      padding: 2px 4px;
      border-radius: 3px;
      border-left: 3px solid #dc3545;
      margin: 0 1px;
      display: inline;
    }
    
    .diff-content {
      line-height: 1.6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .diff-content h1, .diff-content h2, .diff-content h3 {
      margin: 1rem 0 0.5rem 0;
      font-weight: bold;
    }
    
    .diff-content h1 { font-size: 1.5rem; }
    .diff-content h2 { font-size: 1.25rem; }
    .diff-content h3 { font-size: 1.1rem; }
    
    .diff-content p {
      margin: 0.5rem 0;
    }
    
    .diff-content ul, .diff-content ol {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }
    
    .diff-content li {
      margin: 0.25rem 0;
    }
    
    .diff-content strong {
      font-weight: bold;
    }
    
    .diff-content em {
      font-style: italic;
    }
  `;
