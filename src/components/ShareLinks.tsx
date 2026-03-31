"use client";

interface ShareLinksProps {
  url: string;
  title: string;
}

export function ShareLinks({ url, title }: ShareLinksProps) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { name: "Facebook", href: `https://facebook.com/sharer/sharer.php?u=${encoded}` },
    { name: "X", href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}` },
    { name: "WhatsApp", href: `https://api.whatsapp.com/send/?phone&text=${encodedTitle}%20${encoded}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/shareArticle?mini=true&url=${encoded}&title=${encodedTitle}` },
  ];

  return (
    <div className="flex gap-3">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          {link.name}
        </a>
      ))}
    </div>
  );
}
