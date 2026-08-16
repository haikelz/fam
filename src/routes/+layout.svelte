<script lang="ts">
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import "../app.css";

  let { children } = $props();

  let dark = $state(false);

  const SITE_NAME = "fam.";
  const TITLE = "fam. — Add a LinkedIn frame to your photo";
  const DESCRIPTION =
    "Add a LinkedIn Open to Work or Hiring frame to your profile photo. Runs entirely in your browser — no upload. Export a ready-to-use 800×800 PNG.";

  const canonical = $derived(new URL(page.url.pathname, page.url.origin).href);
  const ogImage = $derived(new URL("/opengraph.png", page.url.origin).href);
  const jsonLd = $derived(
    `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: SITE_NAME,
      url: canonical,
      description: DESCRIPTION,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any"
    })}<\/script>`
  );

  function initTheme() {
    dark = document.documentElement.dataset.theme === "ekel-dark";
  }

  function toggleTheme() {
    dark = !dark;
    document.documentElement.dataset.theme = dark ? "ekel-dark" : "ekel";
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }

  onMount(initTheme);
</script>

<svelte:head>
  <title>{TITLE}</title>
  <meta name="description" content={DESCRIPTION} />
  <link rel="icon" href="/logo.svg" type="image/svg+xml" />
  <link rel="canonical" href={canonical} />
  <meta name="robots" content="index, follow" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:title" content={TITLE} />
  <meta property="og:description" content={DESCRIPTION} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="fam. — add a LinkedIn frame to your photo" />
  <meta property="og:locale" content="en_US" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={TITLE} />
  <meta name="twitter:description" content={DESCRIPTION} />
  <meta name="twitter:image" content={ogImage} />
  <meta name="twitter:image:alt" content="fam. — add a LinkedIn frame to your photo" />

  {@html jsonLd}
</svelte:head>

<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-border focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-foreground"
>
  Skip to content
</a>

<!-- ekel.dev grid background: desktop column dividers at 25 / 50 / 75 percent -->
<div
  class="fixed inset-0 z-0 hidden pointer-events-none md:block"
  aria-hidden="true"
>
  <div class="relative h-full mx-auto max-w-6xl">
    <div class="absolute inset-0 border-x border-border/30"></div>
    <div
      class="absolute top-0 bottom-0 left-1/4 border-l border-dashed border-border/30"
      style="border-left-width: 0.5px"
    ></div>
    <div
      class="absolute top-0 bottom-0 left-1/2 border-l border-dashed border-border/30"
      style="border-left-width: 0.5px"
    ></div>
    <div
      class="absolute top-0 bottom-0 left-3/4 border-l border-dashed border-border/30"
      style="border-left-width: 0.5px"
    ></div>
  </div>
</div>

<div class="relative z-10 flex min-h-screen flex-col">
  <header class="w-full border-b border-border/40">
    <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
      <a
        href="/"
        class="text-sm font-medium tracking-tight text-foreground no-underline"
      >
        fam.
      </a>
      <button
        type="button"
        onclick={toggleTheme}
        class="btn btn-ghost btn-sm border border-border/40"
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {#if dark}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path
              d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
            />
          </svg>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        {/if}
      </button>
    </div>
  </header>

  <main
    id="main-content"
    class="mx-auto w-full max-w-6xl flex-1 px-6 pt-24 pb-16"
  >
    {@render children()}
  </main>

  <footer class="w-full border-t border-border/40">
    <div
      class="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm text-muted-foreground"
    >
      <span
        >Brought to you by
        <a
          href="https://ekel.dev"
          target="_blank"
          rel="noreferrer"
          class="font-medium text-foreground underline decoration-border/30 underline-offset-2"
        >
          ekel.dev
        </a>
      </span>
    </div>
  </footer>
</div>
