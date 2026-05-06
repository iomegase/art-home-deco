import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { BlogImage } from "@/components/blog/blog-image";
import { buildBlogImageAlt } from "@/features/blog/seo";
import { listPublishedBlogPosts } from "@/server/repositories/blog.repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journal decoration",
  description: "Guides d'achat, conseils deco, idees cadeaux et inspirations maison Art Home Déco.",
};

export default async function BlogPage() {
  const posts = await listPublishedBlogPosts();

  let postPointer = 0;

  const layoutSchema = [
    { type: "post" }, { type: "post" }, { type: "post" }, { type: "post" },
    { type: "featured" }, 
    { type: "post" },
    { type: "logo" },     
    { type: "post" }, { type: "post" },
    { type: "featured" }, 
    { type: "post" }, { type: "post" }, { type: "post" }, { type: "post" },
    { type: "post" }, { type: "post" }, { type: "post" }, { type: "post" },
  ];

  return (
    <main className="bg-white min-h-screen">
      
      {/* HEADER ÉDITORIAL AVEC PHOTO */}
      <header className="max-w-7xl mx-auto px-8 pt-12 md:pt-20">
              
          {/* DIV OVER PHOTO - Bas à gauche (Style Audrey) */}
          <div className="z-20 mb-7 md:mb-12 max-w-2xl  ">
           
               <h2 className="font-thin text-4xl md:text-6xl tracking-tighter text-slate-400 leading-none">
                L&apos;Inspiration <br />
                <span className="italic text-slate-400">Éditoriale.</span>
              </h2>
          
          </div>
        {/* Photo Hero Header avec Overlay en bas à gauche */}
        <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden bg-slate-50">
          <Image 
            src="https://images.unsplash.com/photo-1605733513597-a8f8341084e6?q=80&w=3629&auto=format&fit=crop" 
            alt="Art Home Déco Inspiration"
            fill
            priority
            className="object-cover grayscale-[0.2] rounded-md"
          />
    
          
          {/* Overlay subtil global */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10  rounded-md to-transparent"></div>
        </div>

        {/* Bloc de description centré sous la photo */}
        <div className="py-16 md:py-24 max-w-4xl mx-auto">
          <h1 className="text-lg text-center leading-9 tracking-tight text-slate-500 font-light italic">
            Nunc libero lacus, pellentesque sodales ullamcorper eget, vehicula id neque. Nunc tortor dolor, scelerisque at orci ac, euismod semper dui. Phasellus tempor tellus quis ligula posuere porta. Proin maximus enim sit amet dui porttitor fringilla vel quis nunc.
          </h1>
        </div>
      </header>

      {/* Grille 6 colonnes - Structure mémorisée */}
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4  lg:grid-cols-6 gap-2 max-w-7xl mx-auto px-8 bg-white pb-24 ">
        {layoutSchema.map((item, index) => {
          
          // --- CAS 1 : CARTE LOGO ---
          if (item.type === "logo") {
            return (
              <div 
                key={`logo-${index}`} 
                className="relative aspect-square bg-[#fcfcfc] flex items-center justify-center overflow-hidden "
              >
                <div className="relative w-full h-full p-10">
                  <Image 
                    src="/logo.png" 
                    alt="Logo Art Home Déco" 
                    fill 
                    className="object-contain p-6 opacity-55  " 
                    priority 
                  />
                </div>
              </div>
            );
          }

          // --- CAS 2 : ARTICLES (Posts classiques et Featured) ---
          const currentPost = posts[postPointer];
          if (!currentPost) return null;
          postPointer++;

          const isFeatured = item.type === "featured";

          return (
            <article 
              key={currentPost.id} 
              className={`group relative aspect-square overflow-hidden bg-white cursor-pointer 
                ${isFeatured ? "lg:col-span-2 lg:row-span-2" : ""}`}
            >
              <Link href={`/blog/${currentPost.slug}`} className="absolute inset-0 z-0">
                <BlogImage
                  src={currentPost.imageUrl}
                  alt={buildBlogImageAlt(currentPost)}
                  fill
                  sizes={isFeatured ? "(max-width: 1024px) 100vw, 33vw" : "(max-width: 1024px) 50vw, 16vw"}
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110 rounded-sm "
                />
                
                <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  
                  <div className={`flex flex-col items-center transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ${isFeatured ? "gap-10" : "gap-4"}`}>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-terracotta rotate-45"></div>
                      <span className={`font-light uppercase tracking-[0.2em] text-white/90 ${isFeatured ? "text-[11px]" : "text-[9px]"}`}>
                        {currentPost.category || "Déco"}
                      </span>
                    </div>

                    <div className={`border border-white/30 bg-white/5 ${isFeatured ? "px-8 py-3" : "px-5 py-2"}`}>
                      <span className={`font-bold uppercase tracking-[0.3em] text-white ${isFeatured ? "text-[12px]" : "text-[10px]"}`}>
                        Voir
                      </span>
                    </div>

                    <h2 className={`font-serif text-white leading-snug line-clamp-2 ${isFeatured ? "text-xl max-w-[260px]" : "text-sm max-w-[150px]"}`}>
                      {currentPost.title}
                    </h2>
                  </div>

                </div>
              </Link>
            </article>
          );
        })}
      </section>

      <footer className="py-24 flex flex-col items-center gap-8 bg-white border-t border-slate-50">
        <div className="w-px h-20 bg-slate-100"></div>
        <p className="text-[10px] tracking-[0.8em] text-slate-300 uppercase italic">Art Home Déco</p>
      </footer>
    </main>
  );
}