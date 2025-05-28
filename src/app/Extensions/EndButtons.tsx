
import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import React from 'react'

interface EndButtonsProps {
  handleAccept: () => void
  handleReject: () => void
}

const EndButtonsComponent: React.FC<EndButtonsProps> = ({ handleAccept, handleReject }) => {
  return (
    <span
      contentEditable={false}
      style={{
        marginLeft: 8,
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      <button
        type="button"
        onClick={handleAccept}
        style={{ marginRight: 8, cursor: 'pointer' }}
      >
        Accept
      </button>
      <button
        type="button"
        onClick={handleReject}
        style={{ cursor: 'pointer' }}
      >
        Reject
      </button>
    </span>
  )
}

const EndButtons = (handleAccept: () => void, handleReject: () => void) => {
  return Node.create({
    name: 'endButtons',
    group: 'block',
    atom: true,
    selectable: false,

    parseHTML() {
      return [{ tag: 'span[data-type="end-buttons"]' }]
    },

    renderHTML() {
      return ['span', { 'data-type': 'end-buttons' }, 0]
    },

    addNodeView() {
      // Return React component as NodeView with handlers closed in
      return ReactNodeViewRenderer(() => (
        <EndButtonsComponent
          handleAccept={handleAccept}
          handleReject={handleReject}
        />
      ))
    },
  })
}

export default EndButtons
