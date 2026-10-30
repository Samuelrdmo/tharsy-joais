# Verificação — Tharsy

Conferência realizada em 30/10/2026.

## Testado

- Build de produção com TypeScript e Vite.
- Quatro testes de domínio: centavos e entrada em reais; busca sem distinção de acento e filtros combinados; ordenação determinística; WhatsApp com nome, preço, link e texto para esgotado.
- Migration real executada em PostgreSQL embarcado PGlite, com schemas Supabase simulados.
- Seed executado duas vezes, mantendo 12 produtos sem duplicação.
- Leitura anônima do catálogo; escrita de visitante bloqueada.
- Usuário autenticado sem autorização: escrita e autopromoção a administradora bloqueadas.
- Administradora autorizada: criação e edição transacionais, validação de preço, cinco fotos no máximo, URL segura e detecção de conflito.
- Exclusão com cascata dos registros de imagem, fila persistente e bloqueio de remoção de arquivos ainda usados por produtos.
- Navegador: abertura da vitrine em desktop e celular de 390 px; identidade, fotos e campos conferidos visualmente.
- Tela de 320 px: uma coluna no catálogo e largura da página sem rolagem horizontal.
- Busca por “essência”, filtro de anéis e detalhes de produto esgotado.
- Prévia da mensagem do WhatsApp para esgotado, incluindo link da peça e preço.
- Entrada explícita no painel demonstrativo.
- Cadastro pelo celular de uma peça fictícia com duas fotos reais de teste, otimização no navegador e seleção da segunda foto como capa.
- Salvamento local e listagem da 13ª peça; paginação carregando os 13 produtos.
- Edição de preço para R$ 179,90 e mudança para esgotado, refletidas na lista.
- Confirmação de exclusão: cancelar manteve o produto; confirmar removeu somente a peça de teste e retornou aos 12 exemplos.

## Depende da configuração da loja

### Atualização: conexão com o Supabase real

O projeto `rreasylrotoibonkxjlv` foi conectado em 30/10/2026. A migration e o seed foram executados no painel. A verificação por API usando somente a chave pública confirmou:

- 12 produtos lidos do banco real, com imagens e preços em centavos.
- Visitante recebe `is_admin() = false`.
- Tentativa de chamar `save_product` como visitante é recusada pelo servidor (`42501`).
- A tabela de autorização administrativa não pode ser lida publicamente.

O login foi adaptado para **usuário e senha**, com usuário `tharsyadmin`. O teste de mapeamento cobre normalização de maiúsculas/espaços e rejeição de e-mail e de outros usuários. A conta e os testes autenticados de cadastro, upload e exclusão dependem da conclusão da criação e autorização no Supabase; não é necessário fornecer e-mail real.

A leitura pública e o bloqueio de escrita anônima já foram verificados no serviço real, conforme os itens acima. Login autenticado e upload ainda dependem da conta administrativa. O teste embarcado valida SQL e regras, mas não simula toda a infraestrutura de Auth, Storage e rede.

O número real do WhatsApp não foi informado. A composição da mensagem e a prévia foram testadas; abrir uma conversa com a loja depende de preencher `VITE_WHATSAPP_NUMBER`. Nenhuma mensagem foi enviada.

A logo oficial e as fotos do estoque real ainda devem substituir a assinatura e a coleção demonstrativas. A hospedagem inicial mantém audiência privada para revisão.
