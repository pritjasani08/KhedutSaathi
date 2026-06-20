-- Drop the table and recreate it properly to match your custom Auth (users table)
drop table if exists crop_diagnosis_history cascade;

create table crop_diagnosis_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  crop text not null,
  disease text not null,
  status text not null,
  confidence numeric,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Disable Row Level Security since your project uses custom Auth (localStorage)
alter table crop_diagnosis_history disable row level security;

-- Keep only latest 4 records per user
create or replace function keep_last_4_crop_diagnosis()
returns trigger
language plpgsql
as $$
begin
  delete from crop_diagnosis_history
  where id in (
    select id
    from crop_diagnosis_history
    where user_id = new.user_id
    order by created_at desc
    offset 4
  );
  return new;
end;
$$;

-- Trigger
drop trigger if exists crop_diagnosis_history_limit_trigger on crop_diagnosis_history;
create trigger crop_diagnosis_history_limit_trigger
after insert on crop_diagnosis_history
for each row
execute function keep_last_4_crop_diagnosis();
