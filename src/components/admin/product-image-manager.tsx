import {
  deleteProductImageAction,
  importProductImageFromUrlAction,
  reorderProductImagesAction,
  updateProductImageAltAction,
  uploadProductImagesAction,
} from "@/features/product/image-actions";
import { ProductImageFallback } from "@/components/product/product-image-fallback";

type ProductImageManagerProps = {
  productId: string;
  productTitle: string;
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    position: number;
    updatedAt?: Date | string;
  }>;
};

export function ProductImageManager({ productId, productTitle, images }: ProductImageManagerProps) {
  function withCacheBuster(url: string, updatedAt?: Date | string) {
    if (!updatedAt) {
      return url;
    }

    const version = new Date(updatedAt).getTime();
    if (Number.isNaN(version)) {
      return url;
    }

    return url.includes("?") ? `${url}&v=${version}` : `${url}?v=${version}`;
  }

  return (
    <section className="border border-line bg-surface p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="section-title text-terracotta">Visuels</p>
          <h3 className="mt-2 font-serif text-3xl">Images produit</h3>
        </div>
        <p className="text-sm text-muted">6 images max, 5 MB max, formats avif/jpg/jpeg/png/webp.</p>
      </div>

      <form action={uploadProductImagesAction} className="mt-6 grid gap-4 border border-line p-4">
        <input type="hidden" name="productId" value={productId} />
        <label className="text-sm font-bold">
          Uploader des images
          <input
            type="file"
            name="images"
            accept=".avif,.webp,.jpeg,.jpg,.png,image/avif,image/webp,image/jpeg,image/png"
            multiple
            required
            className="mt-2 block w-full border border-line bg-background px-3 py-3"
          />
        </label>
        <button type="submit" className="w-fit bg-brand px-4 py-2 text-sm font-bold text-brand-contrast">
          Ajouter les images
        </button>
      </form>

      <form action={importProductImageFromUrlAction} className="mt-4 grid gap-4 border border-line p-4">
        <input type="hidden" name="productId" value={productId} />
        <label className="text-sm font-bold">
          Ajouter une image par URL
          <input
            type="url"
            name="imageUrl"
            required
            placeholder="https://cdn.lyophilise.fr/41500-xl_default/opinel-n8-outdoor-knife-sea-and-mountain-85-cm.jpg"
            className="mt-2 block w-full border border-line bg-background px-3 py-3"
          />
        </label>
        <label className="text-sm font-bold">
          Alt image
          <input
            name="alt"
            defaultValue={productTitle}
            className="mt-2 block w-full border border-line bg-background px-3 py-3"
          />
        </label>
        <p className="text-xs leading-6 text-muted">
          L&apos;image est telechargee cote serveur puis stockee comme les autres visuels produit. URLs
          `http/https` publiques uniquement, sans signature sensible.
        </p>
        <button type="submit" className="w-fit border border-line px-4 py-2 text-sm font-bold hover:border-foreground">
          Importer depuis URL
        </button>
      </form>

      <div className="mt-6 grid gap-4">
        {images.length === 0 ? (
          <p className="text-sm text-muted">Aucune image pour ce produit.</p>
        ) : (
          images.map((image, index) => (
            <article key={image.id} className="grid gap-4 border border-line p-4 md:grid-cols-[8rem_1fr]">
              <div className="relative aspect-square overflow-hidden bg-background">
                <ProductImageFallback
                  src={withCacheBuster(image.url, image.updatedAt)}
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
