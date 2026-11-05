import { getMetadata } from "~/lib/metadata";
import { Banner } from "~/modules/marketing/home/banner";
import { Faq } from "~/modules/marketing/home/faq";
import { Features } from "~/modules/marketing/home/features";
import { Hero } from "~/modules/marketing/home/hero";
import { Testimonials } from "~/modules/marketing/home/testimonials";

export const generateMetadata = getMetadata({
  title: "marketing:home.seo.title",
  description: "marketing:product.description",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Testimonials />
      <Faq />
      <Banner />
    </>
  );
}
