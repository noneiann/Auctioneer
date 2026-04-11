import Link from "next/link";

const footerLinks = {
  explore: [
    { label: "Featured", href: "/featured" },
    { label: "Auctions", href: "/auctions" },
    { label: "Categories", href: "/categories" },
    { label: "How It Works", href: "/how-it-works" },
  ],
  sell: [
    { label: "Start Selling", href: "/seller/auctions/create" },
    { label: "Seller Dashboard", href: "/seller" },
    { label: "Pricing", href: "/pricing" },
    { label: "Seller Guide", href: "/seller-guide" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

const socialLinks = [
  { label: "Twitter", href: "https://twitter.com" },
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Facebook", href: "https://facebook.com" },
];

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-foreground font-semibold text-sm uppercase tracking-wider mb-4">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-neutral-500 hover:text-foreground transition-colors text-sm"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-neutral-100 text-foreground">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h2 className="text-foreground font-bold text-lg">Auctioneer</h2>
            <p className="text-neutral-500 text-sm mt-2">
              Bid on what you love.
            </p>
          </div>

          {/* Explore */}
          <FooterLinkColumn title="Explore" links={footerLinks.explore} />

          {/* Sell */}
          <FooterLinkColumn title="Sell" links={footerLinks.sell} />

          {/* Support */}
          <FooterLinkColumn title="Support" links={footerLinks.support} />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-sm">
            &copy; 2025 Auctioneer. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-foreground transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
