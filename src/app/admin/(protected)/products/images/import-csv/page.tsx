import Link from "next/link";
import { ProductImagesCsvImportPanel } from "@/components/admin/product-images-csv-import-panel";

export default function AdminProductImagesImportCsvPage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/products/missing-images" className="border border-line px-4 py-2 text-sm font-bold">
          Retour produits sans photo
        </Link>
      </div>
      <ProductImagesCsvImportPanel />
    </div>
  );
}
