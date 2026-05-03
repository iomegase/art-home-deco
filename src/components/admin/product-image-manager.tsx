import Image from "next/image";
import {
  deleteProductImageAction,
  reorderProductImagesAction,
  updateProductImageAltAction,
  uploadProductImagesAction,
} from "@/features/product/image-actions";

type ProductImageManagerProps = {
  productId: string;
  productTitle: string;
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    position: number;
  }>;
};

export function ProductImageManager({ productId, productTitle, images }: ProductImageManagerProps) {
  return (
    <section className="border border-line bg-surface p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="section-title text-terracotta">Visuels</p>
          <h3 className="mt-2 font-serif text-3xl">Images produit</h3>
        </div>
        <p className="text-sm text-muted">6 images max, 5 MB max, formats jpg/png/webp.</p>
      </div>

      <form action={uploadProductImagesAction} className="mt-6 grid gap-4 border border-line p-4">
        <input type="hidden" name="productId" value={productId} />
        <label className="text-sm font-bold">
          Uploader des images
          <input
            type="file"
            name="images"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="mt-2 block w-full border border-line bg-background px-3 py-3"
          />
        </label>
        <button type="submit" className="w-fit bg-brand px-4 py-2 text-sm font-bold text-brand-contrast">
          Ajouter les images
        </button>
      </form>

      <div className="mt-6 grid gap-4">
        {images.length === 0 ? (
          <p className="text-sm text-muted">Aucune image pour ce produit.</p>
        ) : (
          images.map((image, index) => (
            <article key={image.id} className="grid gap-4 border border-line p-4 md:grid-cols-[8rem_1fr]">
              <div className="relative aspect-square overflow-hidden bg-background">
                <Image
                  src={image.url}
                  alt={image.alt ?? productTitle}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>

              <div className="grid gap-3">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-bold">Position {image.position}</span>
                  {index === 0 ? (
                    <span className="border border-line px-2 py-1 text-xs font-bold">Image principale</span>
                  ) : null}
                </div>

                <form action={updateProductImageAltAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input type="hidden" name="imageId" value={image.id} />
                  <input
                    name="alt"
                    defaultValue={image.alt ?? ""}
                    placeholder="Texte alternatif"
                    className="w-full border border-line bg-background px-3 py-2 text-sm"
                  />
                  <button type="submit" className="border border-line px-4 py-2 text-sm font-bold">
                    Enregistrer alt
                  </button>
                </form>

                <div className="flex flex-wrap gap-3">
                  <form action={reorderProductImagesAction}>
                    <input type="hidden" name="productId" value={productId} />
                    <input type="hidden" name="imageId" value={image.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button type="submit" className="border border-line px-4 py-2 text-sm font-bold">
                      Monter
                    </button>
                  </form>
                  <form action={reorderProductImagesAction}>
                    <input type="hidden" name="productId" value={productId} />
                    <input type="hidden" name="imageId" value={image.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button type="submit" className="border border-line px-4 py-2 text-sm font-bold">
                      Descendre
                    </button>
                  </form>
                  <form action={deleteProductImageAction}>
                    <input type="hidden" name="imageId" value={image.id} />
                    <button type="submit" className="border border-line px-4 py-2 text-sm font-bold text-terracotta">
                      Supprimer
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
