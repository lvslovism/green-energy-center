import ProductEditor from "@/components/admin/ProductEditor";

export function generateStaticParams() {
  return [
    { slug: "sodium-ion" },
    { slug: "lithium-ion" },
    { slug: "supercapacitor" },
  ];
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ProductEditor slug={params.slug} />;
}
