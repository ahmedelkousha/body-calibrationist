import React from "react";

function inline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={`${keyPrefix}-b-${index}`}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<em key={`${keyPrefix}-i-${index}`}>{token.slice(1, -1)}</em>);
    }
    lastIndex = match.index + token.length;
    index += 1;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

type Block =
  | { type: "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul" | "ol"; items: string[] };

function parse(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "p", text: paragraph.join(" ") });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h3", text: line.slice(4) });
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h2", text: line.slice(3) });
      continue;
    }
    if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "quote", text: line.slice(2) });
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.*)$/);
    const numbered = line.match(/^\d+\.\s+(.*)$/);
    if (bullet || numbered) {
      flushParagraph();
      const type = bullet ? "ul" : "ol";
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((bullet ?? numbered)![1]);
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

export default function Markdown({ content, className }: { content: string; className?: string }) {
  const blocks = parse(content);
  return (
    <div className={className ?? "prose-shelley"}>
      {blocks.map((block, index) => {
        const key = `block-${index}`;
        switch (block.type) {
          case "h2":
            return <h2 key={key}>{inline(block.text, key)}</h2>;
          case "h3":
            return <h3 key={key}>{inline(block.text, key)}</h3>;
          case "quote":
            return <blockquote key={key}>{inline(block.text, key)}</blockquote>;
          case "ul":
            return (
              <ul key={key}>
                {block.items.map((item, i) => (
                  <li key={`${key}-${i}`}>{inline(item, `${key}-${i}`)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={key} className="list-decimal ml-5 space-y-2 mb-6">
                {block.items.map((item, i) => (
                  <li key={`${key}-${i}`}>{inline(item, `${key}-${i}`)}</li>
                ))}
              </ol>
            );
          default:
            return <p key={key}>{inline(block.text, key)}</p>;
        }
      })}
    </div>
  );
}
