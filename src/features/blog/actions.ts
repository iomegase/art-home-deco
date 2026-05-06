"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { blogPostDeleteSchema, blogPostEditorSchema, blogPostStatusSchema } from "@/schemas/forms/blog-editor.schema";
import {
  deleteBlogPostForAdmin,
  findBlogPostByIdForAdmin,
  setBlogPostStatusForAdmin,
  updateBlogPostForAdmin,
} from "@/server/repositories/blog.repository";
import { requireAdmin } from "@/server/security/auth";
import { uploadBlogImage } from "@/server/services/blog-image/upload-blog-image";

function getTrimmedString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function revalidateBlogPaths(post: { id: string; slug: string }) {
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${post.id}/edit`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
}

export async function updateBlogPostForAdminAction(formData: FormData) {
  await requireAdmin();

  const id = getTrimmedString(formData, "id");
  const parsed = blogPostEditorSchema.parse({
    id,
    title: getTrimmedString(formData, "title"),
    slug: getTrimmedString(formData, "slug"),
    excerpt: getTrimmedString(formData, "excerpt") || undefined,
    content: getTrimmedString(formData, "content"),
    category: getTrimmedString(formData, "category") || undefined,
    imageUrl: getTrimmedString(formData, "imageUrl") || undefined,
    imageAlt: getTrimmedString(formData, "imageAlt") || undefined,
    seoTitle: getTrimmedString(formData, "seoTitle") || undefined,
    seoDescription: getTrimmedString(formData, "seoDescription") || undefined,
    authorLabel: getTrimmedString(formData, "authorLabel") || undefined,
    brandPerspectiveMarkdown: getTrimmedString(formData, "brandPerspectiveMarkdown") || undefined,
    ctaTitle: getTrimmedString(formData, "ctaTitle") || undefined,
    ctaBody: getTrimmedString(formData, "ctaBody") || undefined,
    ctaPrimaryLabel: getTrimmedString(formData, "ctaPrimaryLabel") || undefined,
    ctaPrimaryLink: getTrimmedString(formData, "ctaPrimaryLink") || undefined,
    ctaSecondaryLabel: getTrimmedString(formData, "ctaSecondaryLabel") || undefined,
    ctaSecondaryLink: getTrimmedString(formData, "ctaSecondaryLink") || undefined,
    reviewedByHuman: formData.get("reviewedByHuman") === "on",
  });
  const uploadedFile = formData.get("imageFile");
  const uploadedImageUrl =
    uploadedFile instanceof File && uploadedFile.size > 0
      ? await uploadBlogImage({
          postId: parsed.id,
          file: uploadedFile,
        })
      : undefined;

  const previous = await findBlogPostByIdForAdmin(parsed.id);
  if (!previous) {
    throw new Error("Article introuvable.");
  }

  await updateBlogPostForAdmin({
    ...parsed,
    imageUrl: uploadedImageUrl || parsed.imageUrl,
  });

  revalidateBlogPaths({ id: previous.id, slug: previous.slug });
  if (previous.slug !== parsed.slug) {
    revalidatePath(`/blog/${parsed.slug}`);
  }

  redirect(`/admin/blog/${parsed.id}/edit?saved=1`);
}

export async function changeBlogPostStatusAction(formData: FormData) {
  await requireAdmin();

  const parsed = blogPostStatusSchema.parse({
    id: getTrimmedString(formData, "id"),
    action: getTrimmedString(formData, "action"),
  });

  const previous = await findBlogPostByIdForAdmin(parsed.id);
  if (!previous) {
    throw new Error("Article introuvable.");
  }

  const updated = await setBlogPostStatusForAdmin(parsed);
  revalidateBlogPaths({ id: updated.id, slug: updated.slug });
  if (previous.slug !== updated.slug) {
    revalidatePath(`/blog/${previous.slug}`);
  }

  const statusQuery = parsed.action === "publish" ? "published=1" : "unpublished=1";
  redirect(`/admin/blog/${parsed.id}/edit?${statusQuery}`);
}

export async function deleteBlogPostForAdminAction(formData: FormData) {
  await requireAdmin();

  const parsed = blogPostDeleteSchema.parse({
    id: getTrimmedString(formData, "id"),
  });

  const post = await findBlogPostByIdForAdmin(parsed.id);
  if (!post) {
    throw new Error("Article introuvable.");
  }

  await deleteBlogPostForAdmin(parsed);

  revalidateBlogPaths({ id: post.id, slug: post.slug });
  redirect("/admin/blog?deleted=1");
}
