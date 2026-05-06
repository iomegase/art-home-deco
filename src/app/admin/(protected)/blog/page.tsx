import Link from "next/link";
import { Eye, Pen, Trash2, Plus, FileText, CheckCircle2, Clock } from "lucide-react";
import { deleteBlogPostForAdminAction } from "@/features/blog/actions";
import { listAllBlogPosts } from "@/server/repositories/blog.repository";

type AdminBlogPageProps = {
  searchParams?: Promise<{ page?: string; deleted?: string }>;
};

const PAGE_SIZE = 8;

function toPage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  const query = searchParams ? await searchParams : undefined;
  const posts = await listAllBlogPosts();
  const page = toPage(query?.page);

  // Logique métier : Calcul des statistiques
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  // Logique métier : Pagination
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paginatedPosts = posts.slice(start, start + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 lg:p-20 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* --- CONSOLE DE GESTION (HEADER) --- */}
        <header className="bg-white rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-50 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          
          {/* GAUCHE : IDENTITÉ & ACTION */}
          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-terracotta mb-4">
                Editorial Console
              </p>
              <h1 className="text-5xl md:text-6xl font-serif tracking-tighter text-slate-900 leading-[0.9] mb-6">
                Journal <br />
                <span className="italic text-slate-400">Manager</span>
              </h1>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed font-light">
                Gérez vos publications avec la même précision qu&apos;une
                playlist de studio.
              </p>
            </div>
            
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-3 bg-[#FF5F40] text-white px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl shadow-orange-100 hover:scale-105 transition-all duration-500"
            >
              <Plus className="w-4 h-4" />
              Nouveau Brouillon
            </Link>
          </div>

          {/* DROITE : STATISTIQUES (OCCUPENT TOUT L'ESPACE) */}
          <div className="flex flex-row gap-4 h-full min-h-[280px]">
            {/* Colonne Publiés */}
            <div className="flex-1 bg-[#FDFDFD] rounded-[2.5rem] p-8 border border-slate-50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="text-5xl font-bold text-slate-900 mb-1">{publishedCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                Articles Publiés
              </p>
            </div>

            {/* Colonne Brouillons */}
            <div className="flex-1 bg-[#FDFDFD] rounded-[2.5rem] p-8 border border-slate-50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-6 shadow-sm">
                <Clock className="w-7 h-7 text-amber-500" />
              </div>
              <p className="text-5xl font-bold text-slate-900 mb-1">{draftCount}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                Brouillons
              </p>
            </div>
          </div>
        </header>

        {/* --- LISTE DES ARTICLES --- */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-6">
            <h2 className="text-2xl font-serif italic text-slate-900">Articles récents</h2>
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
                 Page {currentPage} sur {totalPages}
               </span>
            </div>
          </div>

          {query?.deleted && (
            <div className="mx-6 p-4 bg-rose-50 text-rose-500 rounded-2xl text-xs text-center border border-rose-100 animate-in fade-in zoom-in">
              L&apos;article a été retiré du catalogue.
            </div>
          )}

          <div className="space-y-4">
            {paginatedPosts.map((post) => (
              <div 
                key={post.id} 
                className="group bg-white rounded-[2rem] p-5 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-700"
              >
                <div className="flex items-center gap-6 min-w-0">
                  {/* Icône Statut */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${post.status === 'published' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 truncate pr-8 text-lg tracking-tight">
                      {post.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      {post.publishedAt ? post.publishedAt.toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' }) : "En attente de publication"}
                    </p>
                  </div>
                </div>

                {/* Actions épurées */}
                <div className="flex items-center gap-2 pr-4">
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all"
                    title="Modifier"
                  >
                    <Pen className="w-4 h-4" />
                  </Link>

                  {post.status === "published" ? (
                    <Link
                      href={`/blog/${post.slug}`}
                      className="w-11 h-11 rounded-full border border-emerald-100 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                      title="Voir en ligne"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  ) : (
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-slate-100" title="Aperçu indisponible">
                      <Eye className="w-4 h-4" />
                    </div>
                  )}

                  <form action={deleteBlogPostForAdminAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="w-11 h-11 rounded-full flex items-center justify-center text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}

            {paginatedPosts.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-slate-50 rounded-[3rem]">
                <p className="text-slate-300 font-serif italic text-xl">Aucun article trouvé...</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {posts.length > PAGE_SIZE && (
            <nav className="flex justify-center gap-4 pt-16">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={`/admin/blog?page=${n}`}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                    n === currentPage 
                    ? "bg-[#FF5F40] text-white shadow-xl shadow-orange-100 scale-110" 
                    : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  {n.toString().padStart(2, '0')}
                </Link>
              ))}
            </nav>
          )}
        </section>

      </div>
      
      {/* Footer minimaliste */}
      <footer className="mt-32 flex flex-col items-center gap-6">
        <div className="w-px h-12 bg-slate-100"></div>
        <p className="text-[10px] tracking-[0.5em] text-slate-300 uppercase">Art Home Déco — Console</p>
      </footer>
    </div>
  );
}