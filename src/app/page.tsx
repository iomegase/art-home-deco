import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

export default function Home() {
  return (
    <div >
    

      <section className="py-8">
        <Container className="grid gap-6 md:grid-cols-[1.45fr_0.55fr]">
          <div className="showcase-panel rounded-4xl p-6 md:p-8">
            <p className="section-title">Objet de la semaine</p>
            <div className="mt-4 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.8rem] bg-surface-strong p-6">
                <div className="h-52 rounded-[1.7rem] bg-accent/75" />
              </div>
              <div className="rounded-[1.8rem] bg-surface-strong p-6">
                <div className="h-52 rounded-[1.7rem] bg-brand" />
              </div>
            </div>
          </div>

          <aside className="showcase-panel rounded-4xl p-6">
            <p className="section-title">Atouts</p>
            <div className="mt-4 space-y-4 text-sm text-muted">
              <p>Edition limitee</p>
              <p>Matières naturelles</p>
              <p>Livraison 48h</p>
              <p>Retours simplifiés</p>
            </div>
          </aside>
        </Container>
      </section>

      <section className="pb-8">
        <Container>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="showcase-panel rounded-2xl p-4">
              <div className="h-20 rounded-xl bg-accent/70" />
            </div>
            <div className="showcase-panel rounded-2xl p-4">
              <div className="h-20 rounded-xl bg-surface-strong" />
            </div>
            <div className="showcase-panel rounded-2xl p-4">
              <div className="h-20 rounded-xl bg-brand/90" />
            </div>
            <div className="showcase-panel rounded-2xl p-4">
              <div className="h-20 rounded-xl bg-accent/40" />
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-8">
        <Container>
          <div className="rounded-[2rem] bg-brand p-8 text-brand-contrast md:p-10">
            <div className="grid items-center gap-8 md:grid-cols-[1fr_1fr]">
              <div>
                <p className="section-title !text-brand-contrast/70">Ligne Pure</p>
                <h2 className="mt-3 text-4xl">Silhouettes graphiques</h2>
                <p className="mt-4 max-w-xl text-brand-contrast/80">
                  Une esthétique inspirée des galeries design, pensée pour une
                  lecture visuelle forte et un e-commerce plus premium.
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                <ButtonLink href="/boutique">Commander</ButtonLink>
                <ButtonLink href="/contact" variant="ghost">
                  Demander conseil
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-8">
        <Container>
          <div className="grid overflow-hidden rounded-[2rem] border border-line md:grid-cols-2">
            <article className="bg-accent/85 p-8">
              <p className="section-title !text-brand">Nouveau parfum</p>
              <h3 className="mt-3 text-3xl text-brand">Collection Ambre Corail</h3>
              <p className="mt-4 max-w-md text-brand/85">
                Une gamme de flacons et diffuseurs à la présence sculpturale.
              </p>
            </article>
            <article className="bg-surface-strong p-8">
              <p className="section-title">Objet signature</p>
              <h3 className="mt-3 text-3xl">Vase Mono 03</h3>
              <p className="mt-4 max-w-md text-muted">
                Courbe organique, finition mate, équilibre entre art et fonction.
              </p>
            </article>
          </div>
        </Container>
      </section>

      <section className="pb-16 md:pb-20">
        <Container className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
          <article className="showcase-panel rounded-[2rem] p-7">
            <p className="section-title">Notre approche</p>
            <h3 className="mt-3 text-3xl">La deco comme composition</h3>
            <p className="mt-4 text-muted">
              Chaque objet est choisi pour son volume, sa matière et son impact
              visuel dans la pièce.
            </p>
          </article>
          <article className="showcase-panel rounded-[2rem] p-7">
            <div className="h-52 rounded-[1.8rem] bg-[linear-gradient(135deg,#dce3ef,#f2a496)]" />
          </article>
        </Container>
      </section>
    </div>
  );
}
