export default function Acknowledgement() {
  return (
    <section
      data-testid="acknowledgement-section"
      className="relative py-14 bg-stone/60 border-y border-line/60"
    >
      <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
        <p className="overline text-flamingo-700 mb-4">
          Acknowledgement of Country
        </p>
        <p className="font-serif-display text-xl md:text-2xl italic text-plum leading-relaxed">
          We acknowledge the Whadjuk Noongar people, the traditional custodians
          of Walyalup (Fremantle), and pay our respects to Elders past and
          present. Sovereignty was never ceded. We gather, share, and listen on
          this land with humility and gratitude.
        </p>
      </div>
    </section>
  );
}
