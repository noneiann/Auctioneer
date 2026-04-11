"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Dialog,
  DialogPanel,
  DialogBackdrop,
} from "@headlessui/react";
import {
  Search,
  Menu as MenuIcon,
  X,
  Gavel,
  ChevronDown,
  MessageSquare,
  ArrowUpRight,
  ShoppingCart,
  Activity,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/stores/CartStore";
import CartDrawer from "@/components/ui/CartDrawer";

const navLinks = [
  { label: "Featured", href: "/" },
  { label: "Auctions", href: "/auctions" },
  { label: "Market",   href: "/market" },
  { label: "Trade",    href: "/trade" },
];

const categoryLinks = [
  { label: "Art",              href: "/auctions?category=art" },
  { label: "Collectibles",     href: "/auctions?category=collectibles" },
  { label: "Electronics",      href: "/auctions?category=electronics" },
  { label: "Fashion",          href: "/auctions?category=fashion" },
  { label: "Jewelry",          href: "/auctions?category=jewelry" },
  { label: "Shoes",            href: "/auctions?category=shoes" },
  { label: "Sports Equipment", href: "/auctions?category=sports+equipment" },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalCount, setIsOpen: setCartOpen } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      {/* ─── Desktop + Mobile Top Bar ─── */}
      <nav className="sticky top-0 z-50 bg-[#111] border-b border-[#1f1f1f]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[60px] items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              {/* Dark mode: white logo */}
              <Image
                src="/logo-white.svg"
                alt="Auctioneer"
                width={32}
                height={32}
                className="h-8 w-8 transition-transform group-hover:scale-105 hidden dark:block"
                priority
              />
              {/* Light mode: dark logo */}
              <Image
                src="/logo-dark.svg"
                alt="Auctioneer"
                width={32}
                height={32}
                className="h-8 w-8 transition-transform group-hover:scale-105 block dark:hidden"
                priority
              />
              <span className="font-bold text-[13px] tracking-[0.1em] uppercase text-white">
                Auctioneer
              </span>
            </Link>

            {/* Center Nav (desktop) */}
            <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[13px] font-medium transition-colors duration-150 ${
                    isActive(link.href)
                      ? "text-white"
                      : "text-[#737373] hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Categories Dropdown */}
              <Menu as="div" className="relative">
                <MenuButton
                  className={`flex items-center gap-1 text-[13px] font-medium transition-colors duration-150 ${
                    pathname.includes("category")
                      ? "text-white"
                      : "text-[#737373] hover:text-white"
                  }`}
                >
                  Categories
                  <ChevronDown className="h-3.5 w-3.5 mt-0.5" />
                </MenuButton>

                <MenuItems
                  transition
                  className="absolute left-1/2 -translate-x-1/2 mt-4 w-52 origin-top bg-[#181818] border border-[#2a2a2a] rounded-xl shadow-2xl shadow-black/60 focus:outline-none transition data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-150 data-[leave]:duration-100 overflow-hidden"
                >
                  <div className="py-1.5">
                    {categoryLinks.map((cat) => (
                      <MenuItem key={cat.href}>
                        <Link
                          href={cat.href}
                          className="flex items-center justify-between px-4 py-2.5 text-[13px] text-[#a0a0a0] data-[focus]:bg-[#222] data-[focus]:text-white transition-colors"
                        >
                          {cat.label}
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-data-[focus]:opacity-100" />
                        </Link>
                      </MenuItem>
                    ))}
                  </div>
                </MenuItems>
              </Menu>
            </div>

            {/* Right Actions (desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                aria-label="Search"
                className="p-2 text-[#737373] hover:text-white transition-colors"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>

              <button
                type="button"
                aria-label="Cart"
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-[#737373] hover:text-white transition-colors"
              >
                <ShoppingCart className="h-[18px] w-[18px]" />
                {totalCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-[#111]">
                    {totalCount}
                  </span>
                )}
              </button>

              {isAuthenticated && (
                <Link
                  href="/messages"
                  className="p-2 text-[#737373] hover:text-white transition-colors"
                >
                  <MessageSquare className="h-[18px] w-[18px]" />
                </Link>
              )}

              {isAuthenticated && (
                <Link
                  href="/seller"
                  className="ml-1 flex items-center gap-1.5 bg-white text-black text-[13px] font-semibold px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors"
                >
                  <Gavel className="h-3.5 w-3.5" />
                  Sell
                </Link>
              )}

              {isAuthenticated && user ? (
                <Menu as="div" className="relative ml-1">
                  <MenuButton className="w-[34px] h-[34px] rounded-full bg-[#1f1f1f] border border-[#2a2a2a] flex items-center justify-center text-[13px] font-bold text-white hover:border-[#404040] transition-colors focus:outline-none">
                    {user.firstName.charAt(0).toUpperCase()}
                  </MenuButton>

                  <MenuItems
                    transition
                    anchor="bottom end"
                    className="mt-2 w-52 origin-top-right bg-[#181818] border border-[#2a2a2a] rounded-xl shadow-2xl shadow-black/60 focus:outline-none transition data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-150 data-[leave]:duration-100 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-[#222]">
                      <p className="text-sm font-semibold text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-[#737373] truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1.5">
                      <MenuItem>
                        <Link
                          href="/seller"
                          className="block px-4 py-2.5 text-[13px] text-[#a0a0a0] data-[focus]:bg-[#222] data-[focus]:text-white transition-colors"
                        >
                          Seller Dashboard
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <Link
                          href="/activity"
                          className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-[#a0a0a0] data-[focus]:bg-[#222] data-[focus]:text-white transition-colors"
                        >
                          <Activity className="w-3.5 h-3.5" /> Activity History
                        </Link>
                      </MenuItem>
                    </div>
                    <div className="border-t border-[#222] py-1.5">
                      <MenuItem>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2.5 text-[13px] text-red-400 data-[focus]:bg-[#222] data-[focus]:text-red-300 transition-colors"
                        >
                          Sign Out
                        </button>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Menu>
              ) : (
                <Link
                  href="/login"
                  className="ml-1 text-[13px] font-medium text-[#a0a0a0] hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Hamburger / Cart */}
            <div className="flex md:hidden items-center gap-1">
              <button
                type="button"
                aria-label="Cart"
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-[#737373] hover:text-white transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white ring-2 ring-[#111]">
                    {totalCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-[#737373] hover:text-white transition-colors"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Drawer ─── */}
      <Dialog
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        className="relative z-[60] md:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200"
        />
        <div className="fixed inset-0 flex justify-end">
          <DialogPanel
            transition
            className="relative w-full max-w-[300px] bg-[#111] border-l border-[#1f1f1f] shadow-2xl transition-transform data-[closed]:translate-x-full data-[enter]:duration-300 data-[leave]:duration-200"
          >
            <div className="flex items-center justify-between px-5 h-[60px] border-b border-[#1f1f1f]">
              <span className="font-bold text-[13px] tracking-[0.1em] uppercase text-white">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-[#737373] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col px-4 py-5 gap-0.5 overflow-y-auto h-[calc(100vh-60px)]">
              {isAuthenticated && user && (
            <div className="flex items-center gap-3 px-3 py-4 mb-3 border-b border-[#1f1f1f]">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] text-[13px] font-bold text-white shrink-0">
                    {user.firstName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-[#737373] truncate">{user.email}</p>
                  </div>
                </div>
              )}

              <p className="px-3 pt-2 pb-2 text-[10px] font-semibold text-[#4a4a4a] uppercase tracking-widest">
                Browse
              </p>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-white/8 text-white"
                      : "text-[#a0a0a0] hover:bg-[#1a1a1a] hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <p className="px-3 pt-5 pb-2 text-[10px] font-semibold text-[#4a4a4a] uppercase tracking-widest">
                Categories
              </p>
              {categoryLinks.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-[13px] text-[#a0a0a0] hover:bg-[#1a1a1a] hover:text-white transition-colors"
                >
                  {cat.label}
                </Link>
              ))}

              <div className="my-4 border-t border-[#1f1f1f]" />

              {isAuthenticated ? (
                <>
                  <Link
                    href="/seller"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-semibold bg-white text-black hover:bg-neutral-200 transition-colors"
                  >
                    <Gavel className="h-4 w-4" />
                    Sell an Item
                  </Link>
                  <p className="px-3 pt-5 pb-2 text-[10px] font-semibold text-[#4a4a4a] uppercase tracking-widest">
                    Account
                  </p>
                  <Link
                    href="/messages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] text-[#a0a0a0] hover:bg-[#1a1a1a] hover:text-white transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" /> Messages
                  </Link>
                  <Link
                    href="/activity"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] text-[#a0a0a0] hover:bg-[#1a1a1a] hover:text-white transition-colors"
                  >
                    <Activity className="h-4 w-4" /> Activity History
                  </Link>
                  <Link
                    href="/seller"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-[13px] text-[#a0a0a0] hover:bg-[#1a1a1a] hover:text-white transition-colors"
                  >
                    Seller Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="mt-2 px-3 py-2.5 rounded-lg text-[13px] font-medium text-red-400 text-left hover:bg-[#1a1a1a] transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-3 py-2.5 rounded-lg text-[13px] font-semibold bg-white text-black hover:bg-neutral-200 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
      <CartDrawer />
    </>
  );
}
