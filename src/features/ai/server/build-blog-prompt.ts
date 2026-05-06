import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AiBlogDraftInput } from "@/schemas/forms/ai-blog-draft.schema";

const AI_FILES = {
  brandContext: "ai/skills/brand-context.md",
  seoRules: "ai/skills/seo-blog.md",
  editorialStyle: "ai/skills/editorial-style.md",
  articleChecklist: "ai/skills/article-checklist.md",
  promptTemplate: "ai/prompts/generate-blog-article.md",
  schema: "ai/schemas/blog-article.schema.json",
} as const;

async function readAiFile(relativePath: string) {
  const filePath = path.join(process.cwd(), relativePath);
  return readFile(filePath, "utf8");
}

function formatIntentAsAngle(intent: AiBlogDraftInput["intent"]) {
  switch (intent) {
    case "guide_achat":
      return "Guide d'achat SEO local pour une boutique de decoration";
    case "conseil_deco":
      return "Article conseil decoration local pour une boutique de montagne";
    case "idee_cadeau":
      return "Article inspiration et idee cadeau pour une boutique decoration";
    case "tendance":
      return "Article tendance deco utile, editorial et localement pertinent";
  }
}

export async function buildBlogPrompt(input: AiBlogDraftInput) {
  const [brandContext, seoRules, editorialStyle, articleChecklist, promptTemplate, schema] =
    await Promise.all([
      readAiFile(AI_FILES.brandContext),
      readAiFile(AI_FILES.seoRules),
      readAiFile(AI_FILES.editorialStyle),
      readAiFile(AI_FILES.articleChecklist),
      readAiFile(AI_FILES.promptTemplate),
      readAiFile(AI_FILES.schema),
    ]);

  const sections = [
    promptTemplate.replace("{{topic}}", input.topic.trim()).replace("{{angle}}", formatIntentAsAngle(input.intent)),
  ];

  if (input.includeBlogContext) {
    sections.push(`# Contexte marque\n\n${brandContext}`);
  } else {
    sections.push(
      [
        "# Contexte marque",
        "",
        "Contexte local desactive pour ce brouillon.",
        "Ne mentionne pas la boutique, Saint-Gervais-les-Bains, la Haute-Savoie ou le Mont-Blanc sauf si le prompt utilisateur le demande explicitement.",
      ].join("\n"),
    );
  }

  sections.push(
    `# Regles SEO\n\n${seoRules}`,
    `# Style editorial\n\n${editorialStyle}`,
    `# Checklist\n\n${articleChecklist}`,
    `# Schema JSON attendu\n\n${schema}`,
    `# Points a developper\n\n${input.targetKeyword.trim()}`,
    [
      "# Contraintes techniques",
      "",
      "Retourne uniquement du JSON valide.",
      "Aucun texte avant ou apres le JSON.",
      "Aucun HTML.",
      "Le contenu principal doit aller dans contentMarkdown.",
      "Le bloc boutique doit aller dans brandPerspectiveMarkdown.",
    ].join("\n"),
  );

  return sections.join("\n\n");
}
