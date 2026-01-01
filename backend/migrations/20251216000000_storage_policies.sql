-- Enable RLS on storage.objects
-- alter table storage.objects enable row level security;

-- Allow public read access to buckets 'avatars', 'bookings', 'verification'
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id in ('avatars', 'bookings', 'verification') );

-- Allow authenticated users to upload to 'avatars' and 'bookings'
create policy "Authenticated Upload"
  on storage.objects for insert
  with check (
    auth.role() = 'authenticated' and
    bucket_id in ('avatars', 'bookings')
  );

-- Allow authenticated users to update their own objects
create policy "Owner Update"
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( auth.uid() = owner );

-- Allow providers to upload verification docs (restricted in app logic, but RLS allows insert)
create policy "Provider Verification Upload"
  on storage.objects for insert
  with check (
    auth.role() = 'authenticated' and
    bucket_id = 'verification'
  );
