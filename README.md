# Page & Pine Books

You are a senior UI/UX designer and full-stack frontend developer.

I want you to build a modern, premium, fully responsive online bookstore website based on the reference screenshot I have provided.

IMPORTANT:

- Use the provided screenshot as the primary visual reference.

- Recreate the overall layout, spacing, proportions, typography hierarchy, colors, cards, navigation, sections, and visual style as closely as reasonably possible.

- Do NOT simply create a generic bookstore template.

- The final result should feel like a polished production-level ecommerce bookstore.

- Make the implementation responsive for desktop, tablet, and mobile.

- All sections must be functional and interactive.

- Do not use placeholder boxes where real UI elements can be created.

- Use clean, maintainable, reusable components.

==================================================

TECH STACK

==================================================

Use:

- React

- Vite

- TypeScript

- Tailwind CSS

- React Router

- Lucide React icons

- Local mock data for books, categories, authors, etc.

- localStorage for cart/wishlist persistence

Do not use a backend initially.

Structure the application so that a real backend/API can easily be connected later.

==================================================

WEBSITE BRAND

==================================================

Brand name:

PAGE & PINE

BOOKSHOP

Tagline:

"Books that inspire, stories that stay."

Overall visual identity:

- Premium

- Elegant

- Warm

- Editorial

- Minimal

- Bookstore/literary aesthetic

- Sophisticated but approachable

Primary colors should be inspired by the screenshot:

- Deep forest green

- Warm cream/off-white

- Soft beige

- Dark charcoal

- Muted gold/tan accents

- White backgrounds

Avoid excessive bright colors.

Use subtle borders, shadows, rounded corners, and generous whitespace.

==================================================

GLOBAL DESIGN

==================================================

The website should have:

- Maximum content width around 1200–1300px

- Centered content

- Generous horizontal spacing

- Warm cream backgrounds in selected areas

- White product cards

- Subtle shadows

- Elegant serif typography for major headings

- Clean sans-serif typography for navigation, buttons, labels, and product information

- Consistent spacing throughout the site

- High-quality book cover imagery

- Smooth hover animations

- Smooth transitions

- Accessible contrast

- Keyboard-friendly controls

Typography should visually resemble the reference:

Headings:

Elegant editorial serif font.

Body/navigation:

Clean modern sans-serif font.

Use a suitable Google Font combination if necessary, such as:

- Playfair Display / Cormorant Garamond for headings

- Inter / Manrope for UI text

Do not overuse fonts.

==================================================

TOP ANNOUNCEMENT BAR

==================================================

Create a thin dark-green announcement bar at the very top.

Desktop layout:

LEFT:

Small shipping/truck icon

"Free shipping on orders over $50"

CENTER:

"Books that inspire, stories that stay."

RIGHT:

Customer Support

Language selector: EN with dropdown

The bar should be responsive.

On mobile:

Simplify the content and prevent overflow.

==================================================

MAIN NAVIGATION

==================================================

Create a white/cream navigation header.

LEFT:

Logo area:

[small book/logo icon]

PAGE & PINE

BOOKSHOP

CENTER/MAIN:

Navigation links:

HOME

BOOKS

CATEGORIES

BESTSELLERS

NEW ARRIVALS

AUTHORS

ABOUT US

RIGHT:

- Search icon

- Account/user icon

- Shopping cart icon

- Cart quantity badge

Navigation should remain visually similar to the screenshot.

Interactions:

- Navigation links should route to appropriate pages.

- Search opens a search interface.

- Account opens/login page.

- Cart opens cart page.

- Cart badge dynamically updates.

Desktop:

Full navigation.

Tablet/mobile:

Replace navigation links with a hamburger menu.

==================================================

HERO SECTION

==================================================

Create a large premium hero section closely inspired by the screenshot.

Use a warm cream background.

Left side:

Small uppercase eyebrow text:

"DISCOVER. READ. GROW."

Large heading:

"Books for every

mind & moment."

Make "mind & moment." visually emphasized with dark green.

Below heading:

"Your next favorite story is

just a page away."

Buttons:

PRIMARY:

"SHOP NOW →"

SECONDARY:

"EXPLORE COLLECTION"

Below the buttons create a small social-proof area:

Several overlapping circular reader avatars.

Text:

"★★★★★"

"Loved by 10,000+ readers"

Right side:

Create an elegant bookstore still-life composition.

Display a large featured book:

"The Midnight Library"

Matt Haig

Place several books horizontally underneath it:

"Atomic Habits"

James Clear

"The Four Winds"

Kristin Hannah

"The Pilot's Wife"

Anita Shreve

"The Seven Husbands of Evelyn Hugo"

Taylor Jenkins Reid

Add decorative lifestyle elements:

- Ceramic vase

- Plant leaves

- Coffee mug

- Warm wooden surface

- Soft natural lighting

- Editorial photography feel

Add a circular badge:

"New

Arrivals

This Week!"

The hero should NOT feel like a generic ecommerce banner.

It should feel like a premium editorial bookstore.

==================================================

FEATURE BENEFITS BAR

==================================================

Immediately below the hero, create a floating white benefits card.

Four columns:

1.

Truck icon

FREE SHIPPING

On orders over $50

2.

Package/box icon

EASY RETURNS

30-day return policy

3.

Shield icon

SECURE PAYMENTS

100% secure checkout

4.

Tag icon

EXCLUSIVE OFFERS

For our happy readers

Use subtle vertical dividers between columns.

On mobile:

Convert this into a 2-column grid or horizontally scrollable section.

==================================================

CATEGORY SECTION

==================================================

Add a section with:

Small eyebrow:

"BROWSE BY CATEGORY"

Main heading:

"Find Your Next Read"

Right side:

"VIEW ALL CATEGORIES →"

Create six category cards:

1. FICTION

"Explore Stories"

2. NON-FICTION

"Expand Knowledge"

3. SELF-HELP

"Better Yourself"

4. ROMANCE

"Feel the Love"

5. CHILDREN

"Young Minds"

6. CLASSICS

"Timeless Reads"

Each card should:

- Have a large background image

- Have a dark translucent overlay

- Have centered icon

- Have category title

- Have subtitle

- Have subtle hover zoom

- Have rounded corners

The cards should visually resemble the screenshot.

==================================================

BESTSELLERS SECTION

==================================================

Create:

Small eyebrow:

"BESTSELLERS"

Heading:

"Readers' All-Time Favorites"

Right side:

"VIEW ALL BOOKS →"

Create a horizontal row of six product cards.

Books:

1.

It Ends With Us

Colleen Hoover

$13.99

2.

The Midnight Library

Matt Haig

$14.99

3.

Atomic Habits

James Clear

$16.99

4.

The Seven Husbands of Evelyn Hugo

Taylor Jenkins Reid

$15.99

5.

The Four Winds

Kristin Hannah

$14.49

6.

The Alchemist

Paulo Coelho

$11.99

Each product card should include:

- Book cover

- Book title

- Author

- Star rating

- Review count

- Price

- Wishlist/heart icon

- Add-to-cart button or cart icon

- Hover animation

Use realistic book-cover imagery.

The cards should have clean white backgrounds and subtle borders/shadows.

==================================================

PRODUCT CARD INTERACTIONS

==================================================

Every book card must be interactive.

When hovering:

- Slight card lift

- Slight image zoom

- Reveal add-to-cart button

- Show wishlist button

When clicking a book:

Navigate to:

/book/:id

Book detail page should contain:

- Large book cover

- Title

- Author

- Rating

- Price

- Description

- Genre/category

- ISBN

- Publication date

- Publisher

- Quantity selector

- Add to cart

- Buy now

- Wishlist

- Product details

==================================================

NEWSLETTER SECTION

==================================================

Create a large newsletter banner similar to the screenshot.

Background:

Dark forest-green / bookstore lifestyle image.

Text:

"BE PART OF OUR READING COMMUNITY"

Heading:

"Get Updates, Exclusive

Deals & Book Picks"

Description:

"Subscribe to our newsletter and be the first to know

about new arrivals, offers, and more."

Email input:

"Enter your email"

Button:

"SUBSCRIBE"

Include subtle background imagery such as:

- Open book

- Coffee

- Reading glasses

- Cozy reading environment

Add dark overlay so text remains readable.

Form should validate email.

After successful submission display:

"Thanks for subscribing!"

==================================================

TRUST / BRAND VALUES SECTION

==================================================

Below newsletter create four columns:

1.

Bookmark icon

HANDPICKED BOOKS

2.

People/community icon

TRUSTED BY

Book Lovers

3.

Shield/check icon

QUALITY YOU

Can Trust

4.

Heart icon

STORIES THAT

Stay Forever

==================================================

FOOTER

==================================================

Create a dark forest-green footer.

Left:

PAGE & PINE

BOOKSHOP

Description:

"We believe books have the power

to change lives."

Social icons:

Facebook

Instagram

Pinterest

YouTube

Footer columns:

SHOP

- All Books

- New Arrivals

- Bestsellers

- Special Offers

- Gift Cards

HELP

- FAQs

- Shipping & Delivery

- Returns & Refunds

- Track Order

- Contact Us

ABOUT

- Our Story

- Careers

- Blog

- Privacy Policy

- Terms & Conditions

NEWSLETTER

"Join our community of readers."

Email input

SUBSCRIBE button

Bottom footer:

© 2024 Page & Pine Bookshop. All Rights Reserved.

Include payment icons:

Visa

Mastercard

PayPal

Apple Pay

==================================================

PAGES

==================================================

Create these routes:

/

Home

/books

All Books

/books/:id

Book Details

/categories

Categories

/categories/:slug

Category Books

/bestsellers

Bestsellers

/new-arrivals

New Arrivals

/authors

Authors

/authors/:id

Author Details

/search

Search Results

/wishlist

Wishlist

/cart

Shopping Cart

/checkout

Checkout

/account

Account/Login

/about

About Us

==================================================

BOOKS PAGE

==================================================

Create a premium ecommerce books listing page.

Top:

"BROWSE OUR COLLECTION"

"All Books"

Include:

Search bar

Filters:

- Category

- Author

- Price

- Rating

- Availability

- Format

Sort:

- Featured

- Bestselling

- Newest

- Price: Low to High

- Price: High to Low

- Rating

Display products in responsive grid:

Desktop: 4 columns

Tablet: 3 columns

Mobile: 2 columns

Pagination or load-more button.

==================================================

SEARCH

==================================================

Implement functional search.

Search should match:

- Book title

- Author

- Category

- Description

Show:

"Search results for: [query]"

If no results:

"No books found."

Provide suggestions.

==================================================

CART

==================================================

Implement a functional shopping cart.

Features:

- Add product

- Remove product

- Increase quantity

- Decrease quantity

- Clear cart

- Cart subtotal

- Shipping

- Estimated tax

- Total

- Checkout button

Persist cart using localStorage.

==================================================

WISHLIST

==================================================

Implement wishlist functionality.

Users can:

- Add/remove books

- View wishlist

- Move item to cart

Persist wishlist using localStorage.

==================================================

CHECKOUT

==================================================

Create a polished checkout UI.

Sections:

CONTACT INFORMATION

Shipping Address

Payment Method

Order Summary

Fields:

- Full name

- Email

- Phone

- Address

- City

- State

- Postal code

- Country

Payment options:

- Credit/debit card UI

- UPI

- PayPal

For this prototype, do not process real payments.

Display a confirmation page after placing a mock order.

==================================================

DATA

==================================================

Create a structured mock dataset containing at least 20–30 books.

Each book should contain:

{

  id,

  title,

  author,

  price,

  originalPrice,

  category,

  rating,

  reviewCount,

  coverImage,

  description,

  isbn,

  publisher,

  publicationDate,

  pages,

  format,

  bestseller,

  newArrival

}

Use categories:

- Fiction

- Non-Fiction

- Self-Help

- Romance

- Children

- Classics

==================================================

RESPONSIVE DESIGN

==================================================

Desktop reference should closely follow the provided screenshot.

Tablet:

- Adjust grid sizes

- Compress navigation

- Preserve visual hierarchy

Mobile:

- Hamburger navigation

- Hero becomes single-column

- Product grids become 2 columns

- Benefits become 2 columns

- Category cards become 2 columns

- Footer becomes stacked

- Newsletter becomes single-column

- Ensure no horizontal overflow

Use responsive Tailwind breakpoints.

==================================================

ANIMATIONS

==================================================

Keep animations elegant and subtle.

Use:

- fade-in

- slide-up

- hover scale

- card lift

- image zoom

- button transitions

- smooth menu transitions

Do NOT over-animate the website.

Use CSS transitions or Framer Motion only where useful.

==================================================

ACCESSIBILITY

==================================================

Implement:

- semantic HTML

- alt text for images

- accessible buttons

- keyboard navigation

- visible focus states

- proper heading hierarchy

- aria-labels where appropriate

- sufficient color contrast

==================================================

SEO

==================================================

Add:

- meaningful page titles

- meta descriptions

- semantic headings

- image alt text

- clean URLs

==================================================

CODE ARCHITECTURE

==================================================

Use reusable components.

Suggested structure:

src/

  components/

    Header.tsx

    AnnouncementBar.tsx

    Hero.tsx

    BenefitsBar.tsx

    CategoryCard.tsx

    CategorySection.tsx

    BookCard.tsx

    BookGrid.tsx

    BestsellerSection.tsx

    Newsletter.tsx

    TrustSection.tsx

    Footer.tsx

    SearchBar.tsx

    Filters.tsx

    CartItem.tsx

    Rating.tsx

    Button.tsx

  pages/

    Home.tsx

    Books.tsx

    BookDetails.tsx

    Categories.tsx

    CategoryDetails.tsx

    Bestsellers.tsx

    NewArrivals.tsx

    Authors.tsx

    AuthorDetails.tsx

    Search.tsx

    Wishlist.tsx

    Cart.tsx

    Checkout.tsx

    Account.tsx

    About.tsx

  data/

    books.ts

    categories.ts

    authors.ts

  context/

    CartContext.tsx

    WishlistContext.tsx

  hooks/

    useCart.ts

    useWishlist.ts

  types/

    book.ts

  App.tsx

  main.tsx

==================================================

IMPORTANT VISUAL DETAILS

==================================================

Pay special attention to the screenshot's:

- Warm cream background

- Dark green brand color

- Editorial serif headings

- Thin announcement bar

- Clean navigation

- Large split hero section

- Book still-life composition

- Circular "New Arrivals" badge

- Floating benefits panel

- Six category cards

- Six bestseller cards

- Dark lifestyle newsletter banner

- Four trust/value columns

- Large dark-green footer

- Generous whitespace

- Subtle shadows

- Fine borders

- Premium bookstore feeling

Do not make everything perfectly rectangular.

Use the same visual rhythm as the reference.

==================================================

IMAGE HANDLING

==================================================

Use high-quality book cover images and bookstore/lifestyle imagery.

For development, use reliable image URLs or local assets.

Create a centralized image configuration so images can easily be replaced later.

Do not use broken image URLs.

If external images cannot be guaranteed, create an assets folder and clearly identify where I should place:

- book covers

- category images

- hero image

- newsletter image

- logo

==================================================

FUNCTIONAL REQUIREMENTS

==================================================

The final website must actually work.

Do NOT only create a static landing page.

Implement:

- Navigation

- Routing

- Search

- Filtering

- Sorting

- Product details

- Add to cart

- Cart quantity changes

- Wishlist

- localStorage persistence

- Newsletter form

- Checkout flow

- Responsive mobile navigation

==================================================

DEVELOPMENT PROCESS

==================================================

Build the project step by step.

1. Set up the React/Vite project.

2. Configure Tailwind CSS.

3. Create the global design system.

4. Create reusable components.

5. Create mock data.

6. Build the homepage.

7. Build product listing pages.

8. Build product detail page.

9. Build cart.

10. Build wishlist.

11. Build checkout.

12. Add routing.

13. Add responsive design.

14. Add animations.

15. Test every interaction.

16. Fix layout issues.

17. Remove unused code.

18. Ensure there are no TypeScript errors.

19. Ensure there are no console errors.

20. Ensure the application runs successfully.

==================================================

FINAL QUALITY STANDARD

==================================================

The result should look like a real premium ecommerce bookstore, not a coding exercise.

Compare the implementation against the provided screenshot after building it.

Check:

- spacing

- alignment

- typography

- colors

- image proportions

- card sizes

- section heights

- navigation

- hero composition

- footer

- mobile responsiveness

Make adjustments until the visual result closely matches the reference.

Do not stop after creating the homepage.

The complete application should be production-quality frontend code with reusable components and a clean architecture.

At the end, provide:

1. Complete project structure

2. All required source code

3. Installation commands

4. Run commands

5. Explanation of where to replace images

6. Explanation of how the cart/wishlist works

7. List of any remaining limitations 
I have pasted a reference image with this prompt. Create exact like that

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b824f821-d3cb-4bd1-9734-c2595300b920).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
