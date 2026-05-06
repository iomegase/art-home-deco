import { trackEvent } from "@/lib/analytics/ga4";

export function trackPhoneClick() {
  trackEvent("phone_click");
}

export function trackWhatsappClick() {
  trackEvent("whatsapp_click");
}

export function trackEmailClick() {
  trackEvent("email_click");
}

export function trackContactFormSubmit() {
  trackEvent("contact_form_submit");
}

export function trackNewsletterSignup() {
  trackEvent("newsletter_signup");
}

export function trackSearch(query: string) {
  trackEvent("site_search", { search_term: query });
}

export function trackFilterUse(filterName: string, value: string) {
  trackEvent("product_filter", { filter_name: filterName, filter_value: value });
}
