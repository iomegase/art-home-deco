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
        h1: ({ children }) => (
          <h2 className="mt-14 text-[32px] font-[300] leading-tight tracking-[-0.03em] text-[#171717] md:text-[40px]">
            {children}
          </h2>
        ),
        h2: ({ children }) => (
          <h2 className="mt-14 text-[32px] font-[300] leading-tight tracking-[-0.03em] text-[#171717] md:text-[40px]">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-10 text-[22px] font-[300] leading-tight tracking-[-0.02em] text-[#171717]">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mt-6 text-[15px] leading-[1.85] text-slate-600">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mt-6 space-y-2 pl-5 text-[15px] leading-[1.85] text-slate-600">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mt-6 list-decimal space-y-2 pl-5 text-[15px] leading-[1.85] text-slate-600">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="pl-1">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-[#171717]">{children}</strong>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="underline decoration-[#b0a99a] underline-offset-4 transition hover:text-[#747b4f]"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mt-8 border-l-2 border-[#b0a99a] pl-6 text-[16px] font-[300] italic leading-relaxed text-[#b0a99a]">
            {children}
          </blockquote>
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
