# PineEV

Build a premium, production-ready responsive website for my startup "PineEv".

IMPORTANT RULES

- Keep the UI minimal like Google Maps.

- Booking experience should feel like Rapido.

- Do not create a complicated dashboard.

- Mobile-first design.

- Use Google Maps as the primary interface.

- Every screen must feel clean, modern and premium.

------------------------------------

STARTUP DETAILS

------------------------------------

Brand Name: PineEv

Tagline:

Find it. Reserve it. Charge it.

Category:

EV Destination Marketplace

Mission:

Connect EV drivers with verified commercial properties such as hotels, dhabas, restaurants, cafés, offices and parking operators where users can reserve parking and EV charging.

Primary Color:

#16A34A

Accent:

#2563EB

Background:

#FFFFFF

Text:

#111827

Style:

Apple + Google Material 3 + Rapido

------------------------------------

PAGES

------------------------------------

1. Landing Page

2. Find Charger (Google Maps)

3. Property Details

4. Become a Partner

5. Business Dashboard

6. About

7. Contact

------------------------------------

LANDING PAGE

------------------------------------

Sticky Navbar

Left:

PineEv Logo

Right:

Find Charger

Partners

Business

About

Login

Primary Button:

Book Charging

------------------------------------

HERO SECTION

------------------------------------

Large headline:

Reserve EV Charging Before You Arrive

Subtitle:

Book verified parking and EV charging at hotels, dhabas, restaurants and commercial destinations.

Large floating search box:

📍 Current Location

Where do you want to charge?

Search button

Quick filters:

Hotel

Dhaba

Restaurant

Fast DC

AC Charger

Parking

Right side:

Beautiful Google Map preview with green EV charging pins.

Show 3 floating destination cards.

------------------------------------

WHY PINEEV

------------------------------------

4 premium cards

Advance Reservation

Verified Commercial Locations

Secure Digital Payments

Real-Time Availability

------------------------------------

HOW IT WORKS

------------------------------------

Step 1

Search destination

Step 2

Choose charging property

Step 3

Reserve slot

Step 4

Park & Charge

Use simple illustrations.

------------------------------------

POPULAR DESTINATIONS

------------------------------------

Show cards:

Hotel Green Stay

Restaurant Highway Bite

Royal Dhaba

City Mall Parking

Each card contains:

Image

Distance

Rating

Charger Speed

Price

Reserve Button

------------------------------------

BECOME A PARTNER

------------------------------------

Headline:

Turn Your Parking Into Revenue

Target businesses:

Hotels

Dhabas

Restaurants

Cafés

Offices

Parking Operators

Benefits:

More Customers

Additional Revenue

Smart Charger Management

Business Analytics

CTA:

Register Your Property

------------------------------------

MOBILE APP SECTION

------------------------------------

Show Android & iPhone mockups.

Screens:

Map

Booking

Property

Payment Success

------------------------------------

FOOTER

------------------------------------

Company

About

Privacy

Terms

Contact

LinkedIn

Instagram

X

------------------------------------

GOOGLE MAP PAGE

------------------------------------

This is the core experience.

Create a full-screen Google Maps interface.

Keep the map as the background.

Use Google Maps JavaScript API.

------------------------------------

TOP FLOATING SEARCH

------------------------------------

Rounded search pill

Placeholder:

Search hotels, dhabas or chargers

Icons:

Current location

Voice search

Profile

Below search:

Filter chips

All

Fast DC

AC

Hotel

Dhaba

Restaurant

Parking

------------------------------------

MAP MARKERS

------------------------------------

Custom PineEv markers.

Green = Available

Orange = Busy

Grey = Offline

Blue dot = User location

Support clustering.

------------------------------------

BOTTOM SHEET (Rapido Style)

------------------------------------

Collapsed:

Nearest charger

Distance

Price

Expand button

Expanded:

Scrollable property cards.

Each card:

72x72 image

Name

Hotel / Dhaba

Rating

Distance

22kW AC / 60kW DC

Available slots

Price

Green Reserve button

Tap card:

Center map on marker.

------------------------------------

PROPERTY DETAILS PAGE

------------------------------------

Large cover image

Property name

Rating

Address

Open status

Amenities

Restaurant

Washroom

Parking

WiFi

Charger Specifications

Connector

Power

Charging Speed

Pricing

Available slots

Reserve Charging button

Navigation button

Google Maps Directions button

------------------------------------

BOOKING FLOW

------------------------------------

Step 1

Select charger

Step 2

Choose date

Step 3

Select time slot

Step 4

Review booking

Step 5

UPI/Card Payment

Success Screen

QR Code

Booking ID

Navigate Now button

------------------------------------

BUSINESS DASHBOARD

------------------------------------

Minimal analytics.

Cards:

Today's Bookings

Monthly Revenue

Active Chargers

Utilization %

Charts:

Bookings

Revenue

Peak Hours

Recent reservations table.

Property management:

Add charger

Edit availability

View earnings

------------------------------------

GOOGLE MAP FEATURES

------------------------------------

Use real Google Maps.

Features:

Live user location

Current location button

Zoom controls

Custom EV markers

Marker clustering

Directions

Distance calculation

Fit nearby chargers

Search by place

Open Google Maps navigation using:

https://www.google.com/maps/dir/?api=1&destination=LAT,LNG

If mobile:

Launch Google Maps app.

------------------------------------

DATA MODEL

------------------------------------

Each property includes:

id

name

category

latitude

longitude

address

rating

price

chargerType

powerKW

availableSlots

images

amenities

status

------------------------------------

ANIMATIONS

------------------------------------

Smooth bottom-sheet slide

Marker bounce

Card fade

Hover elevation

Button ripple

Page transitions

60 FPS interactions

------------------------------------

RESPONSIVE

------------------------------------

Desktop:

Map + floating UI

Tablet:

Larger bottom sheet

Mobile:

Full-screen map

Rapido-style draggable sheet

Thumb-friendly controls

------------------------------------

FINAL EXPERIENCE

------------------------------------

The website should feel like:

80% Google Maps

20% Rapido

Premium EV startup

Simple, elegant and production-ready.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pineev-charge-map.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/49e4cdd9-f310-4913-b67d-1c644b74e903).

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
