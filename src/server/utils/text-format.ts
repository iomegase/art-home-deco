function titleCaseWordSegment(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toLocaleUpperCase("fr-FR") + value.slice(1).toLocaleLowerCase("fr-FR");
}

function titleCaseWithApostrophes(value: string) {
  return value
    .split("'")
    .map((segment) => titleCaseWordSegment(segment))
    .join("'");
}

function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

const lowercaseCityJoiners = new Set(["a", "au", "aux", "de", "des", "du", "en", "et", "la", "le", "les", "l"]);

export function formatPersonName(value: string) {
  const normalized = normalizeWhitespace(value);

  if (!normalized) {
    return "";
  }

  return normalized
    .split(/([ -])/)
    .map((part) => {
      if (part === " " || part === "-") {
        return part;
      }

      return titleCaseWithApostrophes(part);
    })
    .join("");
}

export function formatCityName(value: string) {
  const normalized = normalizeWhitespace(value).replace(/-/g, " ");

  if (!normalized) {
    return "";
  }

  return normalized
    .split(" ")
    .map((part, index) => {
      const lowered = part.toLocaleLowerCase("fr-FR");

      if (index > 0 && lowercaseCityJoiners.has(lowered)) {
        return lowered === "l" ? "l" : lowered;
      }

      return titleCaseWithApostrophes(part);
    })
    .join("-");
}
