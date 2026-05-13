import fs from "node:fs/promises";
import path from "node:path";

type BuildBlogPromptParams = {
  topic: string;
  angle?: string;
};

async function readAiFile(relativePath: string) {
  const candidates = [
    path.join(process.cwd(), relativePath),
    path.join(process.cwd(), "art-home-deco", relativePath),
    path.join(process.cwd(), "..", relativePath),
    path.join(process.cwd(), "..", "art-home-deco", relativePath),
    path.join(process.cwd(), "..", "..", relativePath),
  ];

  for (const filePath of candidates) {
    try {
      return await fs.readFile(filePath, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code !== "ENOENT") {
        throw error;
      }
    }
  }

  throw new Error(`AI file not found: ${relativePath}. Tried: ${candidates.join(", ")}`);
}

export async function buildBlogArticlePrompt({
  topic,
  angle = "Article conseil SEO local pour une boutique de décoration",
}: BuildBlogPromptParams) {
  const [brandContext, seoRules, editorialStyle, checklist, promptTemplate] =
    await Promise.all([
      readAiFile("ai/skills/brand-context.md"),
      readAiFile("ai/skills/seo-blog.md"),
      readAiFile("ai/skills/editorial-style.md"),
      readAiFile("ai/skills/article-checklist.md"),
      readAiFile("ai/prompts/generate-blog-article.md"),
    ]);

  return `
${promptTemplate}

# Contexte marque

${brandContext}

# Règles SEO

${seoRules}

# Style éditorial

${editorialStyle}

# Checklist

${checklist}

# Sujet demandé

${topic}

# Angle éditorial

${angle}

Retourne uniquement du JSON valide.
Aucun markdown hors des champs JSON prévus.
Aucun commentaire.
Aucun texte avant ou après le JSON.
`;
}
