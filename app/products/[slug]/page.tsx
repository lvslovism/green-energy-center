import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LenisProvider from "@/components/motion/LenisProvider";
import CustomCursor from "@/components/motion/CustomCursor";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import ProductHero from "@/components/products/ProductHero";
import ProductTabs from "@/components/products/ProductTabs";
import ProductCTA from "@/components/products/ProductCTA";
import { products, getProductBySlug } from "@/lib/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) {
    return { title: "Product Not Found | 綠能科技" };
  }
  return {
    title: `${product.nameZh} | 綠能科技`,
    description: product.tagline,
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  return (
    <LenisProvider>
      <CustomCursor />
      <Nav />
      <main>
        <ProductHero product={product} />
        <ProductTabs product={product} />
        <ProductCTA product={product} />
      </main>
      <Footer />
    </LenisProvider>
  );
}
