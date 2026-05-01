type ProductCardProps = {
  title: string;
  category: string;
  price: string;
};

export function ProductCard({ title, category, price }: ProductCardProps) {
  return (
    <article className="showcase-panel organic-cut group rounded-[1.8rem] p-4 transition duration-300 hover:-translate-y-1">
      <div className="mb-4 aspect-[4/5] rounded-[1.2rem] border border-line bg-[linear-gradient(145deg,#eff3f9,#e3eaf4)]" />
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{category}</p>
      <h3 className="mt-2 text-[1.35rem] leading-tight">{title}</h3>
      <p className="mt-3 text-sm font-semibold text-brand">{price}</p>
    </article>
  );
}
