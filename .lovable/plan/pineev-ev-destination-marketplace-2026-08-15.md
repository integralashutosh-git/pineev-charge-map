# PineEv — EV Destination Marketplace

A premium, mobile-first site where the real Google Map is the product: 80% Google Maps, 20% Rapido booking flow.

## What gets built

**Landing page (`/`)**
Sticky navbar (logo left; Find Charger, Partners, Business, About, Login + green "Book Charging" button), hero with "Reserve EV Charging Before You Arrive", floating search box with current-location chip and quick filters (Hotel, Dhaba, Restaurant, Fast DC, AC, Parking), live map preview with green EV pins and 3 floating destination cards. Then Why PineEv (4 cards), How It Works (4 illustrated steps), Popular Destinations (image, distance, rating, charger speed, price, Reserve), Become a Partner teaser, app mockup section (Map / Booking / Property / Payment Success screens), full footer.

**Find Charger (`/find`) — core experience**
Full-screen Google Map background. Floating rounded search pill (place search, current location, voice search, profile) with filter chips below. Custom PineEv markers — green available, orange busy, grey offline, blue user dot — with clustering, fit-to-nearby, zoom + locate controls, marker bounce on select. Rapido-style draggable bottom sheet: collapsed shows nearest charger, distance, price; expanded scrolls property cards (72x72 image, name, category, rating, distance, 22kW AC / 60kW DC, slots, price, green Reserve). Tapping a card centers its marker.

**Property details (`/property/$id`)**
Cover image, name, rating, address, open status, amenities, charger specs (connector, power, speed), pricing, live slot availability, Reserve Charging and Directions (opens `google.com/maps/dir/?api=1&destination=LAT,LNG`, launching the app on mobile).

**Booking flow (`/book/$id`)**
Select charger → date → time slot → review → simulated UPI/Card payment → success screen with QR code, booking ID and "Navigate Now". Real reservations are written to the database and block the slot for others.

**Become a Partner (`/partners`)** — "Turn Your Parking Into Revenue", target businesses, 4 benefits, and a working property registration form (submits for review).

**Business Dashboard (`/dashboard`)** — deliberately minimal, signed-in only: four stat cards (today's bookings, monthly revenue, active chargers, utilization %), three light charts (bookings, revenue, peak hours), recent reservations table, and simple property management (add charger, edit availability, view earnings).

**About (`/about`)** and **Contact (`/contact`)** — brand story, mission, and a contact form that saves messages.

**Login (`/auth`)** — email + Google sign-in, needed only for booking and the dashboard; browsing the map stays public.

## Design system

Primary `#16A34A`, accent `#2563EB`, white background, `#111827` text, all as semantic tokens. Apple-clean typography, Material 3 elevation and ripple, generous rounding, Rapido-style sheet motion. Motion: sheet spring slide, marker bounce, card fade-in, hover elevation, page transitions — all transform/opacity based for 60fps. Responsive: desktop map + floating panels, tablet larger sheet, mobile full-screen map with thumb-friendly draggable sheet.

## Technical notes

- Google Maps Platform connector for the Maps JS API (browser key), Places autocomplete, and geocoding/distance through the server gateway.
- Lovable Cloud backend: `properties`, `chargers`, `slots`/`bookings`, `partner_applications`, `contact_messages`, `profiles`, `user_roles`, plus RLS — public read for approved properties, owner/partner-scoped reads and writes, dashboard data scoped to the signed-in owner. Seeded with realistic Indian highway/hotel/dhaba destinations (Hotel Green Stay, Restaurant Highway Bite, Royal Dhaba, City Mall Parking and more) so the map is full from the first load.
- Data reads via server functions + TanStack Query; the map component is client-only so SSR stays clean.
- Payment step is simulated (always succeeds) and records a paid booking; swapping in Stripe later is a contained change.
- Each page gets its own SEO title, description and social tags.

## Build order

1. Enable Cloud + connect Google Maps; design tokens and shell.
2. Database schema, RLS, seed data.
3. Landing page.
4. Find Charger map + bottom sheet.
5. Property details + booking flow with simulated payment.
6. Auth, partner registration, dashboard.
7. About, Contact, footer pages, responsive and motion polish.
