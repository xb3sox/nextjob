import { Geist_Mono, Geist, Source_Serif_4 } from "next/font/google";

import { getLanguageDirection } from "@workspace/i18n";
import { cn } from "@workspace/ui";

import { appConfig } from "~/config/app";

const sans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
});

const mono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["300", "400", "500"],
});

interface BaseLayoutProps {
  readonly locale: string;
  readonly children: React.ReactNode;
}

export const BaseLayout = ({ children, locale }: BaseLayoutProps) => {
  const direction = getLanguageDirection(locale);
  return (
    <html
      lang={locale}
      dir={direction}
      className={cn(sans.variable, serif.variable, mono.variable)}
      data-scroll-behavior="smooth"
      data-theme={appConfig.theme.color}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="bg-background text-foreground flex min-h-screen flex-col font-sans antialiased"
      >
        {children}
      </body>
    </html>
  );
};
