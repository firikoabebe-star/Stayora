import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/home/Hero";
import { SearchSection } from "@/components/home/SearchSection";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { Categories } from "@/components/home/Categories";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <SearchSection />
        <Categories />
        <FeaturedProperties />
      </main>
      <Footer />
    </div>
  );
}
