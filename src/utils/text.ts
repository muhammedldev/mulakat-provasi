export interface PromptEmphasis {
  /** Leading scenario/context sentences, shown muted — empty if the whole prompt is one question. */
  context: string;
  /** The actual decision question, shown in a prominent callout. */
  question: string;
}

// Long "vaka analizi" prompts bundle scenario + question into one paragraph,
// which buries the actual question the user needs to answer at the very end.
// This pulls the final question sentence out so it can be rendered as a
// distinct, prominent callout instead of getting lost in the paragraph.
export function splitPromptEmphasis(text: string): PromptEmphasis {
  const trimmed = text.trim();
  if (!trimmed.endsWith("?")) {
    return { context: "", question: trimmed };
  }

  const beforeMark = trimmed.slice(0, -1);
  let splitIndex = -1;
  [". ", "! "].forEach((sep) => {
    const idx = beforeMark.lastIndexOf(sep);
    if (idx > splitIndex) splitIndex = idx;
  });

  if (splitIndex === -1) {
    return { context: "", question: trimmed };
  }

  return {
    context: trimmed.slice(0, splitIndex + 1).trim(),
    question: trimmed.slice(splitIndex + 2).trim(),
  };
}
