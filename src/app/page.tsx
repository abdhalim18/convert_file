import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomeToolGrid } from "@/components/HomeToolGrid";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-4 text-center sm:px-6 sm:pt-24">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Kelola file PDF & gambar,
            <br className="hidden sm:block" /> semudah menyeret satu klik.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Gabung, pisah, kompres, dan konversi file favorit Anda. Gratis, cepat, dan
            berjalan sepenuhnya di browser Anda sendiri.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
          <HomeToolGrid />
        </section>
      </main>
      <Footer />
    </>
  );
}
