import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-[1160px] px-5">
      <div className="border-t border-line py-12 sm:pb-24 sm:pt-16">
        <Image
          src="/images/dicoding.svg"
          alt="Dicoding"
          width={138}
          height={34}
        />

        <address className="mt-6 max-w-sm text-base leading-7 text-muted not-italic">
          Dicoding Space
          <br />
          Jl. Batik Kumeli No.50, Sukaluyu,
          <br />
          Kec. Cibeunying Kaler, Kota Bandung Jawa
          <br />
          Barat 40123
        </address>
      </div>
    </footer>
  );
}
