"use client";

import type { ReactNode } from "react";

export function ConfirmSubmitButton({
  children,
  className,
  confirmMessage,
}: {
  children: ReactNode;
  className?: string;
  confirmMessage?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
