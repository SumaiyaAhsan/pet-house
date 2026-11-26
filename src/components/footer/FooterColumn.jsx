import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function FooterColumn({ title, links, className = "" }) {
  return (
    <nav aria-label={title} className={className}>
      <h2 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8A8F94]">
        {title}
      </h2>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-1.5 rounded-sm text-[14px] text-[#C9CDD1] transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#111214] sm:text-[15px]"
            >
              <span>{link.label}</span>
              <ArrowUpRight
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
