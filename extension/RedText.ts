// extensions/RedText.ts
import { Mark, markInputRule, RawCommands } from "@tiptap/core";

export const inputRegex = /(?:\*{2})([^*]+)(?:\*{2})$/;

const RedText = Mark.create({
  name: "redText",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-red-text]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      {
        "data-red-text": "true",
        style: "color: red;",
        ...HTMLAttributes,
      },
      0,
    ];
  },

  addCommands() {
    return {
      toggleRedText: () => ({ commands }) => commands.toggleMark(this.name)
    }
  },

  addInputRules() {
    return [markInputRule({ find: inputRegex, type: this.type })]
  },
});

export default RedText;
