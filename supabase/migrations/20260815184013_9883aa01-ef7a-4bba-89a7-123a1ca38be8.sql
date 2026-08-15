-- roles
create type public.app_role as enum ('admin', 'partner', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

-- properties
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  category text not null,
  latitude double precision not null,
  longitude double precision not null,
  address text not null,
  city text not null default '',
  rating numeric(2,1) not null default 4.5,
  price numeric(10,2) not null default 12,
  charger_type text not null default 'AC',
  power_kw integer not null default 22,
  total_slots integer not null default 4,
  available_slots integer not null default 4,
  images text[] not null default '{}',
  amenities text[] not null default '{}',
  status text not null default 'available',
  open_status text not null default 'Open 24 hours',
  description text not null default '',
  approved boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.properties to anon;
grant select, insert, update, delete on public.properties to authenticated;
grant all on public.properties to service_role;
alter table public.properties enable row level security;

create policy "Approved properties are public" on public.properties
  for select using (approved = true);
create policy "Owners can read own properties" on public.properties
  for select to authenticated using (auth.uid() = owner_id);
create policy "Owners can insert own properties" on public.properties
  for insert to authenticated with check (auth.uid() = owner_id);
create policy "Owners can update own properties" on public.properties
  for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Owners can delete own properties" on public.properties
  for delete to authenticated using (auth.uid() = owner_id);

-- chargers
create table public.chargers (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  label text not null,
  connector_type text not null default 'CCS2',
  charger_type text not null default 'DC',
  power_kw integer not null default 60,
  price numeric(10,2) not null default 18,
  status text not null default 'available',
  created_at timestamptz not null default now()
);
grant select on public.chargers to anon;
grant select, insert, update, delete on public.chargers to authenticated;
grant all on public.chargers to service_role;
alter table public.chargers enable row level security;

create policy "Chargers of approved properties are public" on public.chargers
  for select using (exists (select 1 from public.properties p where p.id = property_id and p.approved = true));
create policy "Owners can manage own chargers" on public.chargers
  for all to authenticated
  using (exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid()));

-- bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_ref text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  charger_id uuid references public.chargers(id) on delete set null,
  booking_date date not null,
  time_slot text not null,
  duration_minutes integer not null default 60,
  amount numeric(10,2) not null default 0,
  payment_method text not null default 'upi',
  status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  unique (charger_id, booking_date, time_slot)
);
grant select, insert, update, delete on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;

create policy "Users can read own bookings" on public.bookings
  for select to authenticated using (auth.uid() = user_id);
create policy "Owners can read bookings at their properties" on public.bookings
  for select to authenticated using (exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid()));
create policy "Users can create own bookings" on public.bookings
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own bookings" on public.bookings
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- partner applications
create table public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  business_name text not null,
  category text not null,
  contact_name text not null,
  email text not null,
  phone text not null,
  city text not null,
  address text not null default '',
  parking_slots integer not null default 2,
  message text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
grant insert on public.partner_applications to anon;
grant select, insert on public.partner_applications to authenticated;
grant all on public.partner_applications to service_role;
alter table public.partner_applications enable row level security;

create policy "Anyone can apply" on public.partner_applications
  for insert to anon, authenticated with check (true);
create policy "Applicants can read own applications" on public.partner_applications
  for select to authenticated using (auth.uid() = user_id);

-- contact messages
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default '',
  message text not null,
  created_at timestamptz not null default now()
);
grant insert on public.contact_messages to anon;
grant insert on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;

create policy "Anyone can send a message" on public.contact_messages
  for insert to anon, authenticated with check (true);

-- seed destinations
insert into public.properties (id, name, category, latitude, longitude, address, city, rating, price, charger_type, power_kw, total_slots, available_slots, images, amenities, status, open_status, description) values
('11111111-1111-4111-8111-000000000001','Hotel Green Stay','Hotel',28.6129,77.2295,'Connaught Place Outer Circle, New Delhi','New Delhi',4.8,18.00,'DC',60,6,4,'{https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80}','{Restaurant,Washroom,Parking,WiFi}','available','Open 24 hours','Premium business hotel with covered EV bays and a 60kW fast DC charger.'),
('11111111-1111-4111-8111-000000000002','Restaurant Highway Bite','Restaurant',28.4595,77.0266,'NH-48 Service Road, Sector 29, Gurugram','Gurugram',4.6,16.00,'DC',50,4,2,'{https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80}','{Restaurant,Washroom,Parking}','busy','7:00 AM - 12:00 AM','Highway favourite with quick service and two fast chargers.'),
('11111111-1111-4111-8111-000000000003','Royal Dhaba','Dhaba',28.9845,77.7064,'NH-334, Near Meerut Bypass','Meerut',4.7,12.00,'AC',22,8,7,'{https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80}','{Restaurant,Washroom,Parking}','available','Open 24 hours','Classic north-Indian dhaba with large truck-friendly parking and AC chargers.'),
('11111111-1111-4111-8111-000000000004','City Mall Parking','Parking',28.5672,77.3211,'Sector 18 Mall Complex, Noida','Noida',4.4,14.00,'DC',30,12,9,'{https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1200&q=80}','{Washroom,Parking,WiFi}','available','9:00 AM - 11:00 PM','Basement parking with dedicated EV level and mall access.'),
('11111111-1111-4111-8111-000000000005','Pine Cafe & Charge','Cafe',28.7041,77.1025,'Model Town Main Road, New Delhi','New Delhi',4.9,15.00,'AC',22,4,4,'{https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80}','{Restaurant,Washroom,WiFi}','available','8:00 AM - 11:00 PM','Speciality coffee bar with a calm lounge while your car charges.'),
('11111111-1111-4111-8111-000000000006','Sunrise Business Park','Office',28.4089,77.3178,'Sohna Road, Sector 48, Gurugram','Gurugram',4.3,13.50,'DC',60,10,5,'{https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80}','{Washroom,Parking,WiFi}','available','7:00 AM - 10:00 PM','Grade-A office campus opening its visitor parking to EV drivers.'),
('11111111-1111-4111-8111-000000000007','Sher-e-Punjab Dhaba','Dhaba',30.3398,76.3869,'GT Road, Rajpura, Punjab','Rajpura',4.5,11.50,'DC',60,6,3,'{https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=80}','{Restaurant,Washroom,Parking}','available','Open 24 hours','Legendary GT Road stop with tandoor kitchen and fast charging.'),
('11111111-1111-4111-8111-000000000008','The Lakeview Resort','Hotel',26.9124,75.7873,'Amer Road, Jaipur, Rajasthan','Jaipur',4.8,19.00,'DC',90,4,2,'{https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80}','{Restaurant,Washroom,Parking,WiFi}','available','Open 24 hours','Heritage-style resort with 90kW ultra-fast charging for road trips.'),
('11111111-1111-4111-8111-000000000009','Coastal Grill House','Restaurant',19.0760,72.8777,'Bandra Reclamation, Mumbai','Mumbai',4.6,17.50,'AC',22,3,0,'{https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80}','{Restaurant,Washroom,WiFi}','offline','11:00 AM - 1:00 AM','Seafood grill with valet EV parking. Chargers temporarily offline.'),
('11111111-1111-4111-8111-000000000010','Tech Valley Parking','Parking',12.9716,77.5946,'MG Road, Bengaluru, Karnataka','Bengaluru',4.5,15.50,'DC',60,16,11,'{https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1200&q=80}','{Washroom,Parking,WiFi}','available','Open 24 hours','Central multi-level parking with 16 EV bays and app-based entry.');

insert into public.chargers (property_id, label, connector_type, charger_type, power_kw, price, status) values
('11111111-1111-4111-8111-000000000001','Bay A1','CCS2','DC',60,18.00,'available'),
('11111111-1111-4111-8111-000000000001','Bay A2','CCS2','DC',60,18.00,'available'),
('11111111-1111-4111-8111-000000000001','Bay B1','Type 2','AC',22,12.00,'available'),
('11111111-1111-4111-8111-000000000002','Fast Bay 1','CCS2','DC',50,16.00,'available'),
('11111111-1111-4111-8111-000000000002','Fast Bay 2','CCS2','DC',50,16.00,'busy'),
('11111111-1111-4111-8111-000000000003','Dhaba AC 1','Type 2','AC',22,12.00,'available'),
('11111111-1111-4111-8111-000000000003','Dhaba AC 2','Type 2','AC',22,12.00,'available'),
('11111111-1111-4111-8111-000000000004','Level 2 - E1','CCS2','DC',30,14.00,'available'),
('11111111-1111-4111-8111-000000000004','Level 2 - E2','Type 2','AC',22,11.00,'available'),
('11111111-1111-4111-8111-000000000005','Cafe Charger','Type 2','AC',22,15.00,'available'),
('11111111-1111-4111-8111-000000000006','Visitor DC 1','CCS2','DC',60,13.50,'available'),
('11111111-1111-4111-8111-000000000006','Visitor AC 1','Type 2','AC',22,10.50,'available'),
('11111111-1111-4111-8111-000000000007','GT Fast 1','CCS2','DC',60,11.50,'available'),
('11111111-1111-4111-8111-000000000008','Resort Ultra 1','CCS2','DC',90,19.00,'available'),
('11111111-1111-4111-8111-000000000008','Resort AC 1','Type 2','AC',22,13.00,'available'),
('11111111-1111-4111-8111-000000000009','Valet AC 1','Type 2','AC',22,17.50,'offline'),
('11111111-1111-4111-8111-000000000010','Bay C1','CCS2','DC',60,15.50,'available'),
('11111111-1111-4111-8111-000000000010','Bay C2','CHAdeMO','DC',50,15.00,'available');