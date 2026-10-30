import { Apple } from "lucide-react";

/* Brand-colored payment marks shown as small white chips in the dark footer. */

const chip = "grid h-7 place-items-center rounded-[3px] bg-white px-2 shadow-sm";

function VisaMark() {
  return (
    <span className={chip} title="Visa">
      <svg viewBox="0 0 40 14" className="h-3.5 w-9" role="img" aria-label="Visa">
        <text
          x="20"
          y="11"
          textAnchor="middle"
          fontSize="11"
          fontWeight="800"
          fontStyle="italic"
          fill="#1A1F71"
          fontFamily="Arial, sans-serif"
          letterSpacing="0.5"
        >
          VISA
        </text>
      </svg>
    </span>
  );
}

function MastercardMark() {
  return (
    <span className={chip} title="Mastercard">
      <svg viewBox="0 0 34 16" className="h-4 w-8" role="img" aria-label="Mastercard">
        <circle cx="12" cy="8" r="7" fill="#EB001B" />
        <circle cx="22" cy="8" r="7" fill="#F79E1B" />
        <path d="M17 2.2a7 7 0 0 1 0 11.6 7 7 0 0 1 0-11.6z" fill="#FF5F00" />
      </svg>
    </span>
  );
}

function AmexMark() {
  return (
    <span className={chip} title="American Express">
      <svg viewBox="0 0 36 16" className="h-4 w-9" role="img" aria-label="American Express">
        <rect width="36" height="16" rx="2" fill="#2E77BC" />
        <text
          x="18"
          y="11.5"
          textAnchor="middle"
          fontSize="8"
          fontWeight="800"
          fill="#fff"
          fontFamily="Arial, sans-serif"
        >
          AMEX
        </text>
      </svg>
    </span>
  );
}

function RuPayMark() {
  return (
    <span className={chip} title="RuPay">
      <span className="text-[11px] font-extrabold leading-none tracking-tight">
        <span style={{ color: "#046A38" }}>Ru</span>
        <span style={{ color: "#F26522" }}>Pay</span>
      </span>
    </span>
  );
}

function UpiMark() {
  return (
    <span className={chip} title="UPI">
      <span className="flex items-center gap-0.5">
        <span className="text-[11px] font-extrabold leading-none" style={{ color: "#097C39" }}>
          UPI
        </span>
        <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden="true">
          <path d="M1 1h4l4 4-4 4H1l4-4z" fill="#F47216" />
        </svg>
      </span>
    </span>
  );
}

function PaytmMark() {
  return (
    <span className={chip} title="Paytm">
      <span
        className="text-[11px] font-extrabold lowercase leading-none tracking-tight"
        style={{ color: "#012B72" }}
      >
        pay<span style={{ color: "#00BAF2" }}>tm</span>
      </span>
    </span>
  );
}

function PayPalMark() {
  return (
    <span className={chip} title="PayPal">
      <span className="text-[11px] font-extrabold italic leading-none">
        <span style={{ color: "#003087" }}>Pay</span>
        <span style={{ color: "#009CDE" }}>Pal</span>
      </span>
    </span>
  );
}

function GPayMark() {
  return (
    <span className={chip} title="Google Pay">
      <span className="text-[11px] font-extrabold leading-none">
        <span style={{ color: "#4285F4" }}>G</span>
        <span style={{ color: "#3C4043" }}> Pay</span>
      </span>
    </span>
  );
}

function ApplePayMark() {
  return (
    <span className={chip} title="Apple Pay">
      <span className="flex items-center gap-0.5">
        <Apple className="size-3" style={{ color: "#000" }} fill="#000" />
        <span className="text-[11px] font-extrabold leading-none" style={{ color: "#000" }}>
          Pay
        </span>
      </span>
    </span>
  );
}

export const PAYMENT_MARKS = [
  VisaMark,
  MastercardMark,
  AmexMark,
  RuPayMark,
  UpiMark,
  PaytmMark,
  PayPalMark,
  GPayMark,
  ApplePayMark,
];

export function PaymentBadges({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 ${className}`}
      aria-label="Accepted payment methods"
    >
      {PAYMENT_MARKS.map((Mark, i) => (
        <Mark key={i} />
      ))}
    </div>
  );
}
