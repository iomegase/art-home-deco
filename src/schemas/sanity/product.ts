import { defineArrayMember, defineField, defineType } from "sanity";

export const productSchema = defineType({
  name: "product",
  title: "Product",
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
    defineField({
      name: "sku",
      title: "SKU",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "shortDescription", title: "Short Description", type: "text", rows: 3 }),
    defineField({ name: "description", title: "Description", type: "array", of: [defineArrayMember({ type: "block" })] }),
    defineField({
      name: "price",
      title: "Price (EUR)",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({ name: "compareAtPrice", title: "Compare At Price (EUR)", type: "number" }),
    defineField({
      name: "stockStatus",
      title: "Stock Status",
      type: "string",
      options: {
        list: [
          { title: "In stock", value: "in_stock" },
          { title: "Low stock", value: "low_stock" },
          { title: "Out of stock", value: "out_of_stock" },
        ],
      },
      initialValue: "in_stock",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "stockQuantity", title: "Stock Quantity", type: "number" }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [defineArrayMember({ type: "image", options: { hotspot: true } })],
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "productCategory" }],
    }),
    defineField({ name: "material", title: "Material", type: "string" }),
    defineField({ name: "dimensions", title: "Dimensions", type: "string" }),
    defineField({ name: "color", title: "Color", type: "string" }),
    defineField({ name: "style", title: "Style", type: "string" }),
    defineField({ name: "room", title: "Room", type: "string" }),
    defineField({ name: "careInstructions", title: "Care Instructions", type: "text", rows: 4 }),
    defineField({ name: "tags", title: "Tags", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "isFeatured", title: "Featured Product", type: "boolean", initialValue: false }),
    defineField({ name: "stripePriceId", title: "Stripe Price ID", type: "string" }),
    defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO Description", type: "text", rows: 3 }),
    defineField({ name: "imageAltBase", title: "Image Alt Base", type: "string" }),
    defineField({
      name: "aiStatus",
      title: "AI Status",
      type: "string",
      options: {
        list: [
          { title: "None", value: "none" },
          { title: "Draft generated", value: "draft_generated" },
          { title: "Reviewed", value: "reviewed" },
        ],
      },
      initialValue: "none",
    }),
  ],
});
