import React from "react";
// import HeroSection from "../components/home/HeroSection";
// import HomePage from "./shop-section";
import { HeroSlider } from "../components/home/HeroSlider";
import { CategorySection } from "../components/home/category-section";
import { FlashSaleSection } from "../components/home/flash-sale-section";
import { RecommendedProducts } from "../components/products/recommended-products";
import { ProductGrid } from "../components/products/product-grid";
import { WhyChooseUs } from "../components/home/why-choose-us";
import { TestimonialsSection } from "../components/home/testimonials-section";

export default function Home() {
  return (
    <>
      {/* <HeroSection /> */}
    
       <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
 
      {/* Hero Slider — full width, no padding */}
      <HeroSlider />
        {/* <HomePage /> */}
 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
 
        {/* ১. Category tabs */}
        <CategorySection />
 
        {/* ২. Flash Sale + countdown */}
        <FlashSaleSection />
 
        {/* ৩. Recommended — "আপনার জন্য বাছাই" */}
        <RecommendedProducts categories="groceries,beauty" limit={6} />
 
        {/* ৪. All Products — infinite scroll */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
              সব পণ্য
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
              আমাদের সম্পূর্ণ কালেকশন দেখুন
            </p>
          </div>
          <ProductGrid sort="newest" />
        </section>
 
        {/* ৫. Why choose us */}
        <WhyChooseUs />
 
        {/* ৬. Testimonials */}
        <TestimonialsSection />
 
      </div>
    </main>
    </>
  );
}
