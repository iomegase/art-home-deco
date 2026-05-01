import { defineArrayMember, defineField, defineType } from "sanity";

export const blogPostSchema = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 3 }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "category", title: "Editorial Category", type: "string" }),
    defineField({
      name: "relatedProducts",
      title: "Related Products",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
    }),
    defineField({
      name: "relatedCategories",
      title: "Related Categories",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "productCategory" }] })],
    }),
    defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO Description", type: "text", rows: 3 }),
    defineField({ name: "generatedWithAI", title: "Generated with AI", type: "boolean", initialValue: false }),
    defineField({ name: "reviewedByHuman", title: "Reviewed by Human", type: "boolean", initialValue: false }),
    defineField({ name: "publishedAt", title: "Published At", type: "datetime" }),
  ],
});
