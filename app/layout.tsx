import type { ReactNode } from "react";

import { Providers } from "@/app/providers";

import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="base:app_id" content="178" />
        <meta
          name="talentapp:project_verification"
          content="ee929bb4bb053499a0b13b2fede543a9f9ae293eacd950e4f759ec141ea7ce4d49992fd686486d5df920254c346678d7e62f88bafba27ca2171df5147625f5f5"
        />
        <title>BaseSimpleGovern</title>
        <meta
          name="description"
          content="Create proposals, vote with governance token power, conclude outcomes, and track recent governance activity on Base."
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
