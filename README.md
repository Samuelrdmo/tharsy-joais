# Tharsy — Semi Joias | Acessórios

Catálogo mobile first em React, TypeScript e Vite, com compra pelo WhatsApp e painel de produtos. A vitrine abre sem conta; o painel real exige login Supabase e autorização explícita no banco.

**Conexão configurada:** projeto `rreasylrotoibonkxjlv` da Tharsy. A migration, o bucket e os 12 exemplos já foram criados nesse projeto. Não execute novamente a migration inicial nele. A URL e a chave pública estão no `.env` local, ignorado pelo Git. O acesso da loja usa **usuário `tharsyadmin` e senha**, sem e-mail na tela. Falta concluir a criação e a autorização da conta.

## Executar

Requer Node.js 22.18+ ou 24 e npm.

```powershell
npm install
npm run dev
```

Abra a URL informada pelo Vite. Para gerar a versão de produção:

```powershell
npm run build
npm run preview
```

O diretório `dist` pode ser hospedado como site estático com HTTPS. As rotas usam hash (`/#/produto/id`), então links de produtos funcionam sem configuração de rewrite.

## Demonstração

Sem URL e chave pública completas em `.env`, o site identifica o modo demonstrativo. Há 12 peças fictícias e fotos ilustrativas incluídas no projeto. Em **Área da lojista → Entrar na demonstração**, é possível cadastrar, editar e excluir peças. As mudanças ficam no `localStorage` deste navegador; o acesso demonstrativo fica no `sessionStorage`. **Restaurar demonstração** recupera os 12 exemplos após confirmação.

O modo demo não é autenticação de produção. Ele não tenta gravar no Supabase e não é usado quando a integração está configurada. Não há número de telefone inventado: enquanto não houver um número válido, o botão de compra abre uma prévia copiável da mensagem.

## Conectar o Supabase

1. Crie ou use um projeto Supabase da lojista.
2. No SQL Editor, execute **uma vez** `supabase/migrations/001_catalog.sql`. A migration cria tabelas, índices, funções, políticas RLS e o bucket público `product-photos`.
3. Em Authentication, desative o cadastro público de novos usuários. Este aplicativo não oferece cadastro.
4. Em Authentication → Users → Add user → Create new user, use o identificador técnico `tharsyadmin@auth.tharsy.invalid`, defina a senha e mantenha a conta confirmada (Auto Confirm User). Esse endereço interno não é uma caixa de e-mail e não envia mensagens: o domínio `.invalid` é reservado. A lojista não precisa de e-mail para usar o sistema. Não envie convite por e-mail e não coloque a senha no código.
5. Execute `supabase/authorize-admin.sql` no SQL Editor para autorizar **somente essa conta**. O script exige que ela já exista e não altera senhas. É reexecutável sem duplicar a autorização.

6. Copie `.env.example` para `.env` e preencha:

```dotenv
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA-CHAVE-PUBLICA
VITE_WHATSAPP_NUMBER=55DDDNUMERO
```

Use a chave **publishable/anon pública**, nunca a chave `service_role` ou uma chave secreta. O frontend não tem e não precisa de credenciais privilegiadas. Somente a chave pública e a URL são compiladas para o navegador; a autorização é aplicada no banco e no Storage.

7. Reinicie o Vite. Para produção, reconstrua `dist` e publique novamente. As variáveis `VITE_*` são resolvidas durante o build; alterar somente as variáveis de runtime de uma hospedagem estática não muda um bundle já publicado.
8. Acesse `/#/admin`, entre com o usuário **tharsyadmin** e a senha definida no passo 4 e cadastre uma peça.

Uma conta autenticada que não esteja em `admin_users` não obtém acesso administrativo. A tabela de autorização não aceita escrita via API pelo navegador. Para revogar uma conta, remova sua linha usando o SQL Editor administrativo.

O mapeamento entre o usuário e o identificador interno está em `src/admin-login.ts`. A senha é validada e armazenada pelo Supabase Auth; não há comparação com senha fixa em JavaScript. O nome de usuário aceita maiúsculas e espaços antes/depois, mas não aceita e-mail como login. Como não há caixa de e-mail, uma eventual redefinição de senha é feita pelo responsável do projeto no painel Supabase.

### Produtos demonstrativos no banco — opcional

Execute manualmente `supabase/seed-demo.sql` no SQL Editor **depois** da migration. Ele insere os 12 exemplos com IDs fixos, sem duplicar, apagar ou sobrescrever registros existentes. As imagens apontam para `/images/` desta aplicação. Execute apenas se desejar exemplos no catálogo real. Para regenerar o SQL após editar `src/demo.ts`:

```powershell
node --experimental-strip-types scripts/generate-seed.mjs
```

## Onde alterar a identidade

| Configuração | Arquivo |
|---|---|
| Nome, assinatura e caminho da logo oficial | `src/config.ts` |
| Paleta, tipografia, espaços, raios e estilos compartilhados | `src/styles.css` |
| WhatsApp da loja | `VITE_WHATSAPP_NUMBER` no `.env` |
| Categorias | `src/domain.ts` e constraint correspondente na migration |
| Exemplos de produtos | `src/demo.ts` |
| Título, descrição e fontes | `index.html` |

O componente `Brand` usa assinatura tipográfica com um pequeno símbolo SVG provisório inspirado na referência. Não utiliza nem amplia a foto da fachada ou a imagem pequena. Para substituí-lo, inclua um SVG oficial em `public/` e defina `brand.logoUrl`. O componente já preserva a proporção.

O guia `DESIGN_SYSTEM.md` registra a direção visual e os tokens.

## Fotos e integridade dos dados

- Até cinco fotos por produto, com troca da capa e remoção individual. Nome e preço são obrigatórios; ao menos uma foto é necessária.
- O navegador aceita JPEG, PNG e WebP de até 25 MB como entrada, mantém a proporção e limita o lado maior a 1.600 px. Gera WebP quando disponível, ou JPEG equivalente se suportado pelo navegador, ajustando a qualidade para buscar até 500 KB. Arquivos finais acima de 1 MB são recusados, mantendo o formulário.
- Somente a versão otimizada é enviada. Não há transformação paga de imagem no Supabase.
- Os arquivos recebem caminhos únicos e nunca são sobrescritos. O banco usa centavos inteiros e atualiza produto e fotos em uma transação RPC.
- Fotos removidas ou substituídas entram em `storage_cleanup` na mesma transação. A exclusão do arquivo acontece depois da gravação. A política do Storage impede apagar imagens ainda referenciadas.
- Uploads são registrados na fila antes do envio. Para evitar concorrência com outra aba, uploads sem produto confirmado só entram na limpeza após 15 minutos. O painel retoma a limpeza ao abrir e após operações. Falhas mantêm a fila no banco para nova tentativa.
- A limpeza não é um serviço em segundo plano: se ninguém abrir o painel novamente, a fila permanece pendente. É possível acompanhar a tabela pelo SQL Editor.
- Conflitos entre sessões são rejeitados usando `updated_at`. Se houver falha de rede na confirmação, os dados permanecem no formulário; confira o catálogo antes de repetir.
- O catálogo e o painel carregam 12 produtos por página. Imagens têm proporção reservada e carregamento sob demanda.

## Verificação

```powershell
npm test
npm run build
```

Os testes executam as regras de preço, busca, ordenação e mensagem do WhatsApp. Também executam a migration e o seed em **PostgreSQL embarcado PGlite**, com schemas de Auth e Storage simulados, para verificar autorização, RLS, transações, conflitos, limites de imagens, fila de limpeza e exclusão. Isso não substitui o teste de integração no projeto Supabase real.

Consulte `VERIFICACAO.md` para os fluxos conferidos no navegador e o que depende de configuração externa.

## Referências técnicas e imagens

- [Supabase: login com e-mail e senha](https://supabase.com/docs/reference/javascript/auth-signinwithpassword).
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
- [Supabase: remoção de arquivos](https://supabase.com/docs/reference/javascript/storage-from-remove).
- Fotos demonstrativas do Unsplash, baixadas e incluídas em `public/images`. IDs e URLs estão em `scripts/download-demo-images.mjs`. Elas ilustram a interface e não representam o estoque da loja; troque pelas fotos reais antes do lançamento comercial.

A publicação inicial no Sites é privada para revisão. A vitrine em si não exige login de comprador; liberar a hospedagem para visitantes externos é uma configuração de audiência separada.
