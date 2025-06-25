// HtmlDiffViewer.tsx
import React, { useEffect, useState } from 'react';
import { HtmlDiffer, logger } from 'html-differ';

const htmlDiffer = new HtmlDiffer({
  ignoreAttributes: ['style', 'class'],
  ignoreWhitespaces: true,
  ignoreComments: true,
});

type Props = {
  oldHTML: string;
  newHTML: string;
};

export const HtmlDiffViewer= ( oldHTML, newHTML ) => {

  
      const diff = htmlDiffer.diffHtml(oldHTML, newHTML);

      const rendered = diff
        .map((part) => {
          if (part.added) {
            return `<span class="diff-insert">${part.value}</span>`;
          } else if (part.removed) {
            return `<span class="diff-delete">${part.value}</span>`;
          }
          return part.value;
        })
        .join('');

      
    


  return (
    rendered
  );
};

export const diffStyles = `
  .diff-insert {
    background-color: #d4edda;
    color: #155724;
    padding: 2px 4px;
    border-radius: 3px;
  }

  .diff-delete {
    background-color: #f8d7da;
    color: #721c24;
    padding: 2px 4px;
    border-radius: 3px;
  }

  .diff-content {
    font-family: system-ui, sans-serif;
    line-height: 1.5;
    white-space: pre-wrap;
  }
`;

