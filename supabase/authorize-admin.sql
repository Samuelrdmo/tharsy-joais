-- Execute após criar a conta no Authentication do Supabase com o identificador
-- tharsyadmin@auth.tharsy.invalid e uma senha definida pela responsável.
-- Não altera senha, não cria caixa de e-mail e não concede acesso a outras contas.
do $$
declare v_user uuid;
begin
  select id into v_user from auth.users where lower(email) = 'tharsyadmin@auth.tharsy.invalid';
  if v_user is null then
    raise exception 'Crie primeiro a conta tharsyadmin no Authentication.';
  end if;
  insert into public.admin_users(user_id) values (v_user) on conflict do nothing;
end;
$$;
