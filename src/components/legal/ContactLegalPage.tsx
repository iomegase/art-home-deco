import { legalCompany } from "@/data/legal-pages";

export function ContactLegalPage() {
  return (
    <main className="bg-[#faf8f4] px-6 py-20 text-neutral-900 md:px-10">
      <section className="mx-auto max-w-4xl">
        <header className="mb-14 border-b border-neutral-200 pb-10">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-neutral-500">
            Contact
          </p>

          <h1 className="font-serif text-4xl font-light tracking-tight md:text-6xl">
            Contact
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg">
            Vous souhaitez obtenir une information sur un produit, une commande,
            une livraison, un retour ou une demande professionnelle ? L’équipe{" "}
            {legalCompany.commercialName} vous répond dans les meilleurs délais.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-md border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
              Email
            </p>
            <p className="mt-3 text-sm text-neutral-800">
              {legalCompany.email}
            </p>
          </div>

          <div className="rounded-md border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
              Téléphone
            </p>
            <p className="mt-3 text-sm text-neutral-800">
              {legalCompany.phone}
            </p>
          </div>

          <div className="rounded-md border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
              Adresse
            </p>
            <p className="mt-3 text-sm text-neutral-800">
              {legalCompany.address}
            </p>
          </div>
        </div>

        <section className="mt-10 rounded-md border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-serif text-2xl font-light md:text-3xl">
            Formulaire de contact
          </h2>

          <p className="mt-4 text-sm leading-7 text-neutral-700 md:text-base">
            Les informations transmises via ce formulaire sont utilisées
            uniquement pour répondre à votre demande. Les champs marqués comme
            obligatoires sont nécessaires au traitement de votre message.
          </p>

          <div className="mt-8 grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Prénom
                </label>
                <input
                  type="text"
                  name="firstName"
                  className="mt-2 w-full rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Nom
                </label>
                <input
                  type="text"
                  name="lastName"
                  className="mt-2 w-full rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="mt-2 w-full rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="mt-2 w-full rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                Objet
              </label>
              <input
                type="text"
                name="subject"
                className="mt-2 w-full rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                Message
              </label>
              <textarea
                name="message"
                rows={6}
                className="mt-2 w-full rounded-md border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
              />
            </div>

            <label className="flex items-start gap-3 text-sm leading-6 text-neutral-700">
              <input type="checkbox" className="mt-1 accent-neutral-900" />
              <span>
                J’accepte que les informations transmises soient utilisées pour
                répondre à ma demande, conformément à la politique de
                confidentialité.
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm leading-6 text-neutral-700">
              <input type="checkbox" className="mt-1 accent-neutral-900" />
              <span>
                J’accepte que {legalCompany.commercialName} puisse me répondre
                par WhatsApp concernant ma demande.
              </span>
            </label>

            <button
              type="button"
              className="mt-2 w-fit rounded-md bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Envoyer la demande
            </button>
          </div>
        </section>

        <section className="mt-10 rounded-md border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-serif text-2xl font-light md:text-3xl">
            Réclamations, retours et données personnelles
          </h2>

          <div className="mt-5 space-y-4 text-sm leading-7 text-neutral-700 md:text-base">
            <p>
              Pour toute réclamation relative à une commande, merci d’indiquer
              votre nom, votre adresse email, votre numéro de commande, une
              description précise du problème et des photographies si le produit
              ou le colis est endommagé.
            </p>

            <p>
              Pour une demande de retour ou de rétractation, consultez les
              Conditions Générales de Vente.
            </p>

            <p>
              Les données collectées via le formulaire de contact sont traitées
              conformément à notre Politique de confidentialité.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}