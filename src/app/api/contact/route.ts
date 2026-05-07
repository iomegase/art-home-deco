import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactRequestSchema, type ContactRequest } from "@/features/contact/schemas/contact.schema";
import { getEnv } from "@/server/env";
import { logger } from "@/lib/logger";

function getEmailSubject(type: ContactRequest["type"]) {
  switch (type) {
    case "client":
      return "[Contact Client]";
    case "supplier":
      return "[Contact Fournisseur]";
    case "creator":
      return "[Contact Créateur]";
    default:
      return "[Contact Général]";
  }
}

function buildDetailRows(payload: ContactRequest) {
  const rows: Array<[string, string]> = [
    ["Profil", payload.type],
    ["Prénom", payload.firstName],
    ["Nom", payload.lastName],
    ["Email", payload.email],
    ["Téléphone", payload.phone ?? "Non renseigné"],
    ["Opt-in WhatsApp", payload.whatsappOptIn ? "Oui" : "Non"],
  ];

  if (payload.type === "client") {
    rows.push(["Sujet", payload.clientSubject ?? "Non renseigné"]);
    rows.push(["Numéro de commande", payload.orderNumber ?? "Non renseigné"]);
  }

  if (payload.type === "supplier") {
    rows.push(["Entreprise", payload.companyName ?? "Non renseigné"]);
    rows.push(["Site web", payload.website ?? "Non renseigné"]);
    rows.push(["Catégorie produits", payload.productCategory ?? "Non renseigné"]);
    rows.push(["SIRET", payload.siret ?? "Non renseigné"]);
  }

  if (payload.type === "creator") {
    rows.push(["Marque / atelier", payload.brandName ?? "Non renseigné"]);
    rows.push(["Localisation", payload.location ?? "Non renseigné"]);
    rows.push(["Univers produit", payload.productUniverse ?? "Non renseigné"]);
    rows.push(["Site ou Instagram", payload.websiteOrInstagram ?? "Non renseigné"]);
    rows.push(["Collaboration souhaitée", payload.collaborationType ?? "Non renseigné"]);
  }

  return rows;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildEmailHtml(payload: ContactRequest) {
  const rows = buildDetailRows(payload)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #e7ddca;font-weight:700;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;border:1px solid #e7ddca;vertical-align:top;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  return `
    <div style="font-family:Georgia,serif;color:#1c1a17;line-height:1.6;max-width:720px;margin:0 auto;">
      <h1 style="font-size:28px;margin-bottom:12px;">Nouvelle demande contact Art Home Déco</h1>
      <p style="margin:0 0 24px;color:#5d584f;">${escapeHtml(getEmailSubject(payload.type))}</p>
      <table style="border-collapse:collapse;width:100%;margin-bottom:24px;">${rows}</table>
      <h2 style="font-size:20px;margin:0 0 12px;">Message</h2>
      <div style="padding:16px;border:1px solid #e7ddca;background:#f7f1e3;white-space:pre-line;">${escapeHtml(payload.message)}</div>
    </div>
  `;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = contactRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Le formulaire contient des erreurs.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const payload = parsed.data;

    if (payload.honeypot.trim().length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Demande rejetée.",
        },
        { status: 400 },
      );
    }

    const env = getEnv();

    if (!env.RESEND_API_KEY || !env.CONTACT_FROM || !env.CONTACT_TO) {
      return NextResponse.json(
        {
          success: false,
          message: "Le service de contact n'est pas configuré.",
        },
        { status: 500 },
      );
    }

    const resend = new Resend(env.RESEND_API_KEY);
    const subject = `${getEmailSubject(payload.type)} ${payload.firstName} ${payload.lastName}`;

    const recipients = env.CONTACT_TO.split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const { error } = await resend.emails.send({
      from: env.CONTACT_FROM,
      to: recipients.length > 1 ? recipients : recipients[0] || env.CONTACT_TO,
      replyTo: payload.email,
      subject,
      html: buildEmailHtml(payload),
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Votre message a bien été envoyé. Nous revenons vers vous rapidement.",
    });
  } catch (error) {
    logger.error("Contact form submission failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        message: "Impossible d'envoyer votre message pour le moment.",
      },
      { status: 500 },
    );
  }
}
