import { useEffect } from "react";

/**
 * Flags <body> while the print dialog is open so the stylesheet can drop the app
 * shell and print only the invoice paper (see the @media print block in
 * styles.css, which keys off [data-print-root] / [data-print-invoice]).
 *
 * Only active while `enabled` — otherwise Ctrl+P on the booking form would print
 * a blank page.
 */
export function usePrintInvoice(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const on = () => document.body.classList.add("printing-invoice");
    const off = () => document.body.classList.remove("printing-invoice");
    window.addEventListener("beforeprint", on);
    window.addEventListener("afterprint", off);
    return () => {
      window.removeEventListener("beforeprint", on);
      window.removeEventListener("afterprint", off);
      off();
    };
  }, [enabled]);
}
