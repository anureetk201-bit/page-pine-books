# PAGE & PINE premium bookstore

## Goal
Build a polished, responsive ecommerce bookstore that closely follows the supplied reference: slim announcement bar, editorial navigation, split still-life hero, floating benefits strip, six image categories, six featured books, lifestyle newsletter, trust row, and deep-green footer.

## Experience and visual system
- Use warm cream and paper-white surfaces, deep forest green, charcoal text, and muted gold accents.
- Pair Cormorant Garamond for editorial headings with Manrope for interface text.
- Preserve the reference’s compact proportions, fine borders, restrained shadows, modest corner radii, and generous whitespace.
- Use cohesive generated imagery for the hero still life, category tiles, newsletter scene, reader portraits, and realistic book covers.
- Add restrained lift, image zoom, focus, menu, and reveal transitions with reduced-motion support.

## Foundation
- Define the full semantic design system in `src/styles.css` using OKLCH tokens.
- Build reusable layout, navigation, product, filter, form, feedback, and footer components.
- Create typed local datasets for 24–30 books, categories, and authors with centralized image references.
- Add client-safe cart and wishlist providers persisted to localStorage, with hydration-safe reads.

## Routes and functionality
- `/`: complete reference-matched home page.
- `/books`: searchable, filterable, sortable collection with responsive 4/3/2-column grid and load more.
- `/books/$id`: full product information, quantity selector, wishlist, add-to-cart, and buy-now flow.
- `/categories`, `/categories/$slug`: category discovery and filtered products.
- `/bestsellers`, `/new-arrivals`: dedicated collection pages.
- `/authors`, `/authors/$id`: author directory and author detail collections.
- `/search`: query-driven matching across title, author, category, and description with suggestions.
- `/wishlist`: remove and move-to-cart actions.
- `/cart`: quantity controls, removal, clear cart, totals, and checkout link.
- `/checkout`: validated contact, shipping, payment choice, order summary, and in-page mock confirmation.
- `/account`: polished sign-in/register prototype.
- `/about`: brand story page.
- Give every content route unique title, description, Open Graph, and Twitter metadata.

## Responsive and accessible behavior
- Desktop mirrors the supplied composition and density.
- Tablet switches to condensed navigation and adapted grids.
- Mobile uses a keyboard-accessible menu, stacked hero, two-column products/categories, two-column benefits, and stacked newsletter/footer.
- Add semantic landmarks, single page headings, labeled controls, visible focus states, descriptive alt text, and accessible dialogs.

## Verification
- Exercise navigation, search, filtering, sorting, product details, cart, wishlist, newsletter validation, checkout confirmation, and persistence.
- Compare desktop and mobile screenshots against the reference; correct spacing, typography, image crop, hierarchy, and overflow.
- Check preview diagnostics, console/runtime errors, and responsive layouts before completion.

## Technical details
- Keep the existing TanStack Start/Vite/React/TypeScript stack and its file-based router; do not replace it with React Router DOM.
- Use Lucide icons and existing design-system primitives.
- No backend or real payment processing; data remains local and the architecture keeps data access replaceable later.
- The uploaded screenshot is a design reference only, not embedded into the storefront.
