import { defineConfig, fontProviders } from "astro/config";
import courseGraph from "astro-course-university";
import universityTheme from "astro-theme-university";
import { astromotion, deckRemarkPlugins } from "astromotion";
import { courseMeta } from "./src/course-config.ts";
import { courseApiCollections } from "./src/site-config.ts";
import { gitOrigin, resolveDeployment } from "./scripts/pages-base.ts";

// Derived, never hardcoded --- see scripts/pages-base.ts for why.
const { site, base } = resolveDeployment(process.env, gitOrigin);

export default defineConfig({
  site,
  base,
  // Pages build as directories, so every route URL ends in a slash. Saying so
  // explicitly makes Astro emit matching links, which keeps the canonical URL
  // and what a visitor clicks in agreement --- otherwise each click costs a
  // 301 on GitHub Pages.
  trailingSlash: "always",
  // Registered here rather than pulled from Google at runtime: Astro fetches
  // each face at build time and serves it from our own origin, so the type
  // arrives with the page instead of after it, and no reader is announced to
  // a third party for visiting a course site. The theme merges its own two
  // faces with this list by name, so Public Sans and Roboto Mono survive.
  fonts: [
    {
      // Display only --- section headings and the wordmark. An inscriptional
      // roman, all-caps by construction.
      name: "Cinzel",
      cssVariable: "--font-cinzel",
      provider: fontProviders.google(),
      weights: ["500 700"],
      fallbacks: ["Georgia", "serif"],
    },
    {
      // Running prose. Italic is registered because the course's own voice
      // leans on it for titles and asides.
      name: "Newsreader",
      cssVariable: "--font-newsreader",
      provider: fontProviders.google(),
      weights: ["300 700"],
      styles: ["normal", "italic"],
      fallbacks: ["Georgia", "serif"],
    },
    {
      // Interface chrome: nav, buttons, labels, captions.
      name: "Plus Jakarta Sans",
      cssVariable: "--font-jakarta",
      provider: fontProviders.google(),
      weights: ["300 700"],
      fallbacks: ["system-ui", "sans-serif"],
    },
  ],
  integrations: [
    universityTheme({
      defaultLayout: "src/layouts/PageLayout.astro",
      // The whole brand choice: three colour tokens and a set of lockups. Keep
      // institutional brand packages and assets out of this fictional site.
      // Loaded in order: the Slop house palette, then the course sheet that
      // moves it onto cinnabar and parchment. See src/styles/tang-yin.css.
      // Root-absolute, not "./src/...": the spec is injected into a virtual
      // module, so a relative path resolves against that rather than the
      // project root and the build fails to find it.
      brandCss: ["astro-theme-slop/slop.css", "/src/styles/tang-yin.css"],
      // Body and display are both above the fold on every page.
      preloadFonts: ["--font-newsreader", "--font-cinzel"],
      imageFormat: "avif",
      llmsTxt: true,
      // The theme owns the markdown plugin chain, so astromotion's slide
      // plugins (slide breaks, classes, backgrounds, notes, QR codes) are
      // handed to it rather than registered separately. Each one gates on
      // `.deck.mdx`, so ordinary pages are untouched.
      extraRemarkPlugins: deckRemarkPlugins,
    }),
    courseGraph({
      collections: courseApiCollections,
      timezone: "Australia/Canberra",
      course: courseMeta,
      canonicalUrl: `https://courses.slop.university/${courseMeta.code}/`,
    }),
    // Slide decks: every `.deck.mdx` under src/decks/ becomes a Reveal.js page
    // at /decks/<name>/. The theme's deck stylesheet reads the same brand
    // tokens the site does, so a deck arrives already wearing the Slop palette
    // --- see src/decks/theme.css. `fontVariables` makes the deck page emit the
    // @font-face for the theme's body font, which the deck styles ask for by
    // name.
    astromotion({
      theme: "./src/decks/theme.css",
      fontVariables: ["--font-public-sans"],
    }),
  ],
});
