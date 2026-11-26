import { AtSign, Camera, Play, Share2 } from "lucide-react";

const SOCIAL_ICONS = {
  facebook: Share2,
  instagram: Camera,
  youtube: Play,
  twitter: AtSign,
};

export default function SocialLinks({ links, className = "" }) {
  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {links.map((link) => {
        const Icon = SOCIAL_ICONS[link.icon];

        if (!Icon) {
          return null;
        }

        return (
          <li key={link.label}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={link.label}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1C1F22] text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#111214]"
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
