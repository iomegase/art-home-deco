type BuildCsvOptions = {
  delimiter?: string;
  forceQuoteAll?: boolean;
  lineEnding?: "\n" | "\r\n";
  includeHeaders?: boolean;
};

function escapeCsvValue(value: string, delimiter: string, forceQuoteAll = false) {
  const normalized = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const mustQuote =
    forceQuoteAll ||
    normalized.includes(delimiter) || normalized.includes('"') || normalized.includes("\n");

  if (!mustQuote) {
    return normalized;
  }

  return `"${normalized.replace(/"/g, '""')}"`;
}

export function buildCsvDocument(
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>,
  options: BuildCsvOptions = {},
) {
  const delimiter = options.delimiter ?? ";";
  const forceQuoteAll = options.forceQuoteAll ?? false;
  const lineEnding = options.lineEnding ?? "\n";
  const includeHeaders = options.includeHeaders ?? true;
  const headerLine = headers.map((header) => escapeCsvValue(header, delimiter, forceQuoteAll)).join(delimiter);
  const bodyLines = rows.map((row) =>
    row.map((cell) => escapeCsvValue(String(cell ?? ""), delimiter, forceQuoteAll)).join(delimiter),
  );

  return (includeHeaders ? [headerLine, ...bodyLines] : bodyLines).join(lineEnding);
}
