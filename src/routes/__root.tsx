import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Preloader } from "@/components/Preloader";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);

  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, {
      boundary: "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try refreshing.</p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>

          <a
            href="/"
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        title: "Red Sand Dunes DXB — Luxury Desert Safari Dubai",
      },

      { charSet: "utf-8" },

      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },

      {
        name: "description",
        content:
          "Premium desert safaris, dune bashing, BBQ camps & city tours in Dubai. Book your luxury Arabian adventure with Red Sand Dunes DXB.",
      },

      {
        name: "keywords",
        content:
          "Dubai Desert Safari, Red Sand Dunes Dubai, Evening Desert Safari Dubai, Morning Desert Safari Dubai, VIP Desert Safari Dubai, Luxury Desert Safari Dubai, Desert Safari with Quad Bike, Desert Safari with Dune Buggy, Camel Ride Dubai, Red Dune Safari Dubai, Dubai Tours, Dubai City Tour, BBQ Dinner Desert Safari, Arabian Desert Adventure, Dubai Travel Packages, Dubai Tourism, Desert Safari Booking Dubai, Premium Red Dune Safari Dubai, Private Desert Safari Dubai",
      },

      {
        name: "robots",
        content: "index, follow",
      },

      {
        property: "og:title",
        content: "Luxury Desert Safari Dubai | Red Sand Dunes DXB",
      },

      {
        property: "og:description",
        content:
          "Experience Dubai's best desert safari with dune bashing, camel rides, quad bikes, BBQ dinner, and live entertainment.",
      },

      {
        property: "og:image",
        content: "https://redsanddunesdxb.com/og-image.jpg",
      },

      {
        property: "og:url",
        content: "https://redsanddunesdxb.com",
      },

      {
        property: "og:type",
        content: "website",
      },

      {
        name: "twitter:card",
        content: "summary_large_image",
      },

      {
        name: "twitter:title",
        content: "Luxury Desert Safari Dubai | Red Sand Dunes DXB",
      },

      {
        name: "twitter:description",
        content: "Book premium desert safari experiences in Dubai with Red Sand Dunes DXB.",
      },

      {
        name: "twitter:image",
        content: "https://redsanddunesdxb.com/og-image.jpg",
      },
    ],

    links: [
      { rel: "stylesheet", href: appCss },

      {
        rel: "canonical",
        href: "https://redsanddunesdxb.com",
      },

      {
        rel: "icon",
        href: "/favicon.ico",
      },

      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png",
      },

      {
        rel: "manifest",
        href: "/site.webmanifest",
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-960HCELD6N"></script>

        <script
          dangerouslySetInnerHTML={{
            __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-960HCELD6N', {
        page_path: window.location.pathname,
      });
    `,
          }}
        ></script>
        <HeadContent />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              name: "Red Sand Dunes DXB",
              url: "https://redsanddunesdxb.com",
              image: "https://redsanddunesdxb.com/og-image.jpg",
              description: "Luxury desert safari and city tour operator in Dubai",
            }),
          }}
        />
      </head>

      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Preloader />
      <Outlet />
    </QueryClientProvider>
  );
}
