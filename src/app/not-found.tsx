import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-night px-5 text-center">
      <div>
        <p className="eyebrow text-signal">Error 404</p>
        <h1 className="display display-xl mt-5 text-white">Page not found.</h1>
        <p className="mx-auto mt-5 max-w-[460px] text-[15px] leading-[1.6] text-muted-2">
          The page you are looking for has moved or no longer exists.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-signal">
            Back to home <ArrowRight className="size-4" />
          </Link>
          <Link href="/products" className="btn btn-ghost">
            Browse products <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
