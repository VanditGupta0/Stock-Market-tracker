import Link from "next/link";
import Image from "next/image";
import NavItems from "@/components/NavItems";
import UserDropdown from "@/components/UserDropdown";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-[70px] border-b border-white/5 bg-[#141414]/95 backdrop-blur">
      <div className="site-container flex h-full items-center justify-between gap-6">
        <Link href="/" aria-label="Signalist home" className="shrink-0">
          <Image src="/assets/icons/logo.svg" alt="Signalist" width={148} height={34} priority />
        </Link>

        <nav className="hidden sm:block">
          <NavItems />
        </nav>

        <UserDropdown />
      </div>
    </header>
  );
}
