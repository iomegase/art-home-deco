"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackContactFormSubmit, trackEmailClick, trackPhoneClick } from "@/lib/analytics/events";

type TrackEventType = "phone_click" | "email_click" | "contact_form_submit";

type TrackableLinkProps = ComponentProps<typeof Link> & {
  track: TrackEventType;
};

export function TrackableLink({ track, onClick, ...props }: TrackableLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        if (track === "phone_click") {
          trackPhoneClick();
        }
        if (track === "email_click") {
          trackEmailClick();
        }
        if (track === "contact_form_submit") {
          trackContactFormSubmit();
        }
        onClick?.(event);
      }}
    />
  );
}
