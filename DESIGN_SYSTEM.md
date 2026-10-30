# Identidade digital — Tharsy

**THARSY** em destaque, **SEMI JOIAS | ACESSÓRIOS** na assinatura. Direção editorial com fundo marfim, tipografia serifada, fotos amplas e dourado nos detalhes. A fotografia da fachada e o raster pequeno são referências de identidade, não arquivos de logo.

## Cores

| Token CSS | Valor | Uso |
|---|---|---|
| `--ivory` | `#F7F4EB` | Fundo principal |
| `--surface` | `#FFFEFA` | Formulários, painéis e superfícies |
| `--ink` | `#19191D` | Textos, ícones e botões principais |
| `--gold` | `#C5A447` | Símbolo, linhas, pequenos detalhes |
| `--gold-light` | `#E8D9A8` | Seleções e realces de fundo |
| `--muted` | `#68655E` | Texto secundário |
| `--border` | `#E5E0D5` | Divisórias e contornos |

As sete cores estão centralizadas em `:root`, em `src/styles.css`. Estados de sucesso e erro têm tokens adicionais, sem substituir a identidade principal.

Texto corrente: preto ou cinza sobre marfim/branco quente. Botões principais: preto com texto claro. Seleções: dourado claro com texto preto. Dourado e dourado claro não são usados em texto informativo pequeno sobre branco. Foco de teclado visível em preto.

## Tipografia

**Cormorant Garamond** nos títulos, nomes de produtos e assinatura tipográfica. Itálico pontual em frases editoriais. **Inter** para preços, menus, formulários, mensagens e descrições. Fallbacks: Georgia/serif e Arial/sans-serif.

- Nome da marca: 31 px no celular, 41 px no desktop, com espaçamento entre letras.
- Títulos principais: escala responsiva; 58–112 px na abertura, 42–68 px nas páginas internas.
- Nomes de produtos: 22–27 px, sem truncar os nomes.
- Preços: Inter, 13–14 px nos cards, maior nos detalhes.
- Campos no celular: 16 px para leitura e para evitar zoom involuntário.

## Espaço e superfícies

Escala de espaço: 4, 8, 12, 16, 24, 32, 48, 64 e 96 px (`--space-1` a `--space-9`). Largura máxima: 1.280 px. Cantos discretos de 3–5 px. Contornos neutros de 1 px. Sem gradientes metálicos e sem sombras pesadas. O arco da fotografia principal é um elemento editorial; cards e controles usam raios pequenos.

## Componentes compartilhados

- `Brand` e `Mark`: assinatura consistente no cabeçalho, login e rodapé. `brand.logoUrl` prepara a substituição por arquivo oficial sem redesenhar as telas.
- `Photo`: mantém proporção, carrega sob demanda e oferece fallback acessível.
- `CatalogControls`: busca, categorias, ordenação e disponibilidade em vitrine e painel.
- `WhatsAppButton`: compra ou consulta de esgotado com nome, preço e link da peça. Prévia explicada quando o número ainda não existe.
- `Dialog`: modal nativo com foco contido, Escape, confirmação de exclusão e cancelamento.
- `ErrorBox`, `Loading` e toast: feedback claro, estados vazios e falhas recuperáveis.
- `ProductForm`: um formulário para criação e edição, prévia de capa e ações grandes.

## Responsividade

| Tela | Vitrine | Painel |
|---|---|---|
| Menos de 360 px | Uma coluna, fotos amplas | Lista e formulário em uma coluna |
| 360–639 px | Duas colunas com fotos 4:5 | Cards de produto em uma coluna; CTA de cadastro largo |
| 640–999 px | Duas colunas, ferramentas lado a lado | Lista adaptada ao espaço disponível |
| A partir de 1.000 px | Quatro colunas | Lista horizontal e prévia lateral do formulário |

Botões e ações importantes têm área de toque de pelo menos 48 px. A navegação de categorias pode deslizar horizontalmente dentro do seu próprio contêiner; a página não exige rolagem lateral. O formulário permanece em uma coluna mesmo no desktop, com a prévia separada ao lado.

## Fotografia e conteúdo

Fotos dos produtos são o foco da vitrine. Use boa luz, enquadramento consistente e detalhes visíveis. As fotos incluídas e os preços iniciais são ilustrativos e estão identificados como demonstração. A interface não promete materiais, garantia, descontos ou condições de entrega que a loja ainda não informou.
