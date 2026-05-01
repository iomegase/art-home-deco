import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/sanity/queries";
import type { BlogPost } from "@/types/sanity";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Blog",
  description: "Conseils deco et inspirations Art Home Deco.",
};

const placeholderPosts: BlogPost[] = [
  {
    _id: "post-1",
    title: "Comment mixer bois clair et ceramique brute",
    slug: "bois-clair-ceramique-brute",
  },
  {
    _id: "post-2",
    title: "5 idees pour une entree chaleureuse",
    slug: "idees-entree-chaleureuse",
  },
  {
    _id: "post-3",
    title: "Palette ocre et lin: une ambiance apaisante",
    slug: "palette-ocre-lin",
  },
];

export default async function BlogPage() {
  let posts: BlogPost[] = placeholderPosts;

  try {
    const cmsPosts = await getBlogPosts();
    if (cmsPosts.length > 0) {
      posts = cmsPosts;
    }
  } catch {
    posts = placeholderPosts;
  }

  return (
    <div className="grain-bg showcase-shell page-enter py-14 md:py-20">
      <Container className="showcase-panel rounded-[2rem] p-7 md:p-9">
        <p className="section-title">Journal deco</p>
        <h1 className="mt-3 text-5xl">Inspiration maison</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Base editoriale connectee a Sanity en phase 2, avec fallback local
          tant que l&apos;environnement CMS n&apos;est pas configure.
        </p>
        <div className="mt-10 grid gap-4">
          {posts.map((post) => (
            <article
              key={post._id}
              className="organic-cut rounded-[1.6rem] border border-line bg-surface p-6"
            >
              <h2 className="text-2xl">{post.title}</h2>
              <p className="mt-2 text-sm text-muted">
                Placeholder de listing article avec metadata et visuel a venir.
              </p>
            </article>
          ))}
        </div>
      </Container>
    </div>
  );
}
