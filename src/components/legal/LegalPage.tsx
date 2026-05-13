import type { LegalBlock, LegalPageContent } from "@/data/legal-pages";

type LegalPageProps = {
  page: LegalPageContent;
};

function LegalBlockRenderer({ block }: { block: LegalBlock }) {
  if (block.type === "paragraph") {
    return (
      <p className="text-sm leading-7 text-neutral-700 ">
        {block.text}
      </p>
    );
  }

  if (block.type === "list") {
    return (
      <ul className="space-y-2 pl-5 text-sm leading-7 text-neutral-700 ">
        {block.items.map((item) => (
          <li key={item} className="list-disc">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "table") {
    return (
      <div className="overflow-x-auto rounded-md border border-neutral-200">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-900">
            <tr>
              {block.headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="border-b border-neutral-200 px-4 py-3 font-medium"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={`${row.join("-")}-${rowIndex}`} className="bg-white">
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${cell}-${cellIndex}`}
                    className="border-b border-neutral-100 px-4 py-3 align-top text-neutral-700"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}

export function LegalPage({ page }: LegalPageProps) {
  return (
    <main className="bg-white px-6 py-20 text-neutral-900 md:px-10">
      <article className="mx-auto max-w-4xl">
        <header className="mb-14  pb-10">
          <p className="mb-4 mt-10 text-xs font-medium uppercase tracking-[0.28em] text-[#bd9254]">
            Informations légales
          </p>

          <h1 className=" text-4xl font-thin tracking-tight md:text-6xl">
            {page.title}
          </h1>

          <p className="mt-6 max-w-2xl text-md italic leading-6 text-slate-900 ">
            {page.description}
          </p>

          <p className="mt-10 text-xs uppercase tracking-[0.18em] text-[#bd9254]">
            Dernière mise à jour : {page.lastUpdated}
          </p>
        </header>

        <div className="space-y-12">
          {page.sections.map((section, index) => (
            <section
              key={section.title}
              className=" bg-white   md:p-8"
            >
              <div className="mb-6 flex items-start gap-4">
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#bd9254] text-xs text-[#bd9254]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h2 className="font-serif text-2xl font-light text-neutral-950 md:text-3xl">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-5">
                {section.blocks.map((block, blockIndex) => (
                  <LegalBlockRenderer
                    key={`${section.title}-${blockIndex}`}
                    block={block}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}