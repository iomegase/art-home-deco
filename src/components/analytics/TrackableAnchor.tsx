"use client";

import type { AnchorHTMLAttributes } from "react";
import { trackEmailClick, trackPhoneClick, trackWhatsappClick } from "@/lib/analytics/events";

type AnchorTrackEvent = "phone_click" | "email_click" | "whatsapp_click";

type TrackableAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  track: AnchorTrackEvent;
};

export function TrackableAnchor({ track, onClick, ...props }: TrackableAnchorProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        if (track === "phone_click") {
          trackPhoneClick();
        }
        if (track === "email_click") {
          trackEmailClick();
        }
        if (track === "whatsapp_click") {
          trackWhatsappClick();
        }
        onClick?.(event);
      }}
    />
  );
}
