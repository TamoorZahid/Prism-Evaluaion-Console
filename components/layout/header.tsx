"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  HelpCircle,
  Moon,
  Sun,
  Menu,
  Home,
  Settings,
  BarChart3,
  Database,
} from "lucide-react";
import { useTheme } from "next-themes";
import { GlossaryDialog } from "@/components/glossary-dialog";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LogoPrism } from "@/components/logo-prism";
export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [showGlossary, setShowGlossary] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/evaluation/setup", label: "Setup", icon: Settings },
    { href: "/ground_truth", label: "Ground-Truth", icon: Database },
    { href: "/evaluation/results", label: "Results", icon: BarChart3 },
  ];

  return (
    <>
      <header className="border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 sticky top-0 z-50">
        <div className="container mx-auto px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <LogoPrism className="h-8 w-[110px] ml-[80px]" />
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                GenAI Evaluation Console
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 flex items-center space-x-1 ${
                  isActive(item.href)
                    ? "text-blue-600"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            {/* Glossary Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGlossary(true)}
              className="text-slate-600 dark:text-slate-400 hidden sm:flex"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Glossary
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-6">
                  <div className="flex items-center space-x-2 mb-8">
                    <LogoPrism className="h-[30px] w-[110px]" />
                  </div>

                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.href)
                          ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  <div className="border-t pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowGlossary(true);
                        setShowMobileMenu(false);
                      }}
                      className="w-full justify-start"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Glossary
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Breadcrumbs */}
        {pathname !== "/" && (
          <div className="border-t bg-slate-50/50 dark:bg-slate-800/50">
            <div className="container mx-auto px-4 py-2">
              <Breadcrumbs />
            </div>
          </div>
        )}
      </header>

      <GlossaryDialog open={showGlossary} onOpenChange={setShowGlossary} />
    </>
  );
}
