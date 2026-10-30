// A loja usa somente usuário e senha. Este identificador interno não é uma
// caixa de e-mail: o domínio .invalid é reservado e nunca recebe mensagens.
// A senha permanece no Supabase Auth, sem ser incluída no código/configuração.
export const adminAccount = {
  username: 'tharsyadmin',
  displayName: 'Tharsy Joias Admin',
  authIdentity: 'tharsyadmin@auth.tharsy.invalid',
} as const;

export function resolveAdminIdentity(username: string): string | null {
  return username.trim().toLowerCase() === adminAccount.username ? adminAccount.authIdentity : null;
}
