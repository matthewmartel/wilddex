
create or replace function public.get_friend_suggestions(limit_count int default 10)
returns table (
  user_id uuid,
  mutual_count bigint
)
language sql
security definer
set search_path = public
as $$
  with my_friends as (
    select case
      when requester_id = auth.uid() then addressee_id
      else requester_id
    end as friend_id
    from public.friendships
    where status = 'accepted'
      and (requester_id = auth.uid() or addressee_id = auth.uid())
  ),
  candidates as (
    select
      case
        when requester_id in (select friend_id from my_friends) then addressee_id
        else requester_id
      end as candidate_id,
      case
        when requester_id in (select friend_id from my_friends) then requester_id
        else addressee_id
      end as via_friend
    from public.friendships
    where status = 'accepted'
      and (
        requester_id in (select friend_id from my_friends)
        or addressee_id in (select friend_id from my_friends)
      )
  )
  select c.candidate_id as user_id, count(distinct c.via_friend) as mutual_count
  from candidates c
  where c.candidate_id <> auth.uid()
    and c.candidate_id not in (select friend_id from my_friends)
    and not exists (
      select 1 from public.friendships f
      where f.status = 'pending'
        and (
          (f.requester_id = auth.uid() and f.addressee_id = c.candidate_id)
          or (f.addressee_id = auth.uid() and f.requester_id = c.candidate_id)
        )
    )
  group by c.candidate_id
  order by mutual_count desc
  limit limit_count;
$$;

revoke all on function public.get_friend_suggestions(int) from public;
grant execute on function public.get_friend_suggestions(int) to authenticated;
