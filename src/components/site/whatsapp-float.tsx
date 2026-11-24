import { whatsappHref } from "@/lib/utils";
import { WhatsAppIcon } from "./icons";

export function WhatsAppFloat({ number }: { number: string }) {
  if (!number) return null;
  return (
    <a
      href={whatsappHref(number, "Hello, I would like to ask about a wholesale order.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed right-5 bottom-5 z-30 grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform hover:scale-105"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
