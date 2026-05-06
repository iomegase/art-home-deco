import ReactMarkdown from "react-markdown";

function normalizeMarkdown(content: string) {
  return content
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+(#{2,6}\s+)/g, "\n\n$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function BlogMarkdown({ content }: { content: string }) {
  const markdown = normalizeMarkdown(content);

  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => <h2 className="mt-12 font-serif text-3xl leading-tight md:text-4xl">{children}</h2>,
        h2: ({ children }) => <h2 className="mt-12 font-serif text-3xl leading-tight md:text-4xl">{children}</h2>,
        h3: ({ children }) => <h3 className="mt-8 font-serif text-2xl leading-tight">{children}</h3>,
        p: ({ children }) => <p className="mt-5 text-base leading-8 text-foreground">{children}</p>,
        ul: ({ children }) => <ul className="mt-5 list-disc space-y-2 pl-6 text-base leading-8">{children}</ul>,
        ol: ({ children }) => <ol className="mt-5 list-decimal space-y-2 pl-6 text-base leading-8">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
        a: ({ href, children }) => (
          <a href={href} className="underline decoration-line underline-offset-4 hover:text-terracotta">
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mt-6 border-l-2 border-terracotta pl-4 italic text-muted">{children}</blockquote>
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
