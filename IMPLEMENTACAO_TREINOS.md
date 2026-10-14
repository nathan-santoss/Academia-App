# Implementação do fluxo de treino

Atualização: 14/10/2026. Branch: `implementacao/mvp-treino-demonstrativo`.

Este documento descreve o código local atual. O relatório com arquivos, evidências, configuração e distribuição está em [RELATORIO_MVP.md](RELATORIO_MVP.md). Não houve deploy desta branch, escrita no Neon nem instalação em telefone durante esta implementação.

## Recorte demonstrativo atual

O fluxo do aluno é cadastro → login → criar rotina pessoal → escolher exercícios do catálogo → configurar divisões e séries → iniciar demonstração → registrar/corrigir/desmarcar séries → encerrar parcial ou completamente → consultar histórico → logout.

A demonstração é uma adaptação temporária autorizada pelo solicitante. Não modifica a exigência de chegada para execução oficial, não cria assinatura, pagamento, autorização excepcional ou presença. O PDF recebido foi `Guia_Implementacao_MVP_Academia_App_14-10-2026.pdf`; a documentação mestre v2.0 não foi disponibilizada separadamente. As referências à documentação mestre foram conferidas pelo guia e pelos registros do repositório, sem preencher decisões em aberto.

## Autenticação e contas

- Novas senhas: mínimo de 8 caracteres, máximo de 72 bytes UTF-8, bcryptjs com custo 12 e salt próprio. Cadastro mobile e backend aplicam o mesmo limite. O login continua aceitando até 128 caracteres para compatibilidade com contas antigas.
- Hash legado `sal:hash` continua verificado com os parâmetros scrypt anteriores. Após login válido, a atualização para bcrypt compara o hash antigo antes de gravar. Falha dessa atualização não impede login. Senhas legadas acima de 72 bytes permanecem scrypt, sem truncamento nem redefinição.
- Login emite JWT HS256 com `sub`, `jti`, `iat`, `exp`, emissor e destinatário fixos. Cada pedido verifica assinatura, algoritmo, claims, sessão no banco e conta/aluno ativos. Permissões funcionais são relidas no banco.
- `sessoes` continua guardando somente SHA-256 do token e sua validade; logout remove a sessão. O JWT permanece no SecureStore, nunca na senha armazenada nem em variável pública. Não há refresh token nesta entrega.
- Tokens opacos anteriores só são aceitos até uma data ISO explícita em `TOKEN_LEGADO_ATE`, além da validade da sessão. Sem essa configuração, exigem novo login. Hashes scrypt permanecem compatíveis independentemente dessa janela.
- Limites em memória por instância: 10 tentativas por e-mail/minuto, 60 por origem/minuto e até 2 cálculos de senha simultâneos. O limite por origem pode agrupar clientes atrás de proxy; não há limitador distribuído.
- Admin/Gestor são preparados somente com `DEMO_CONTAS_HABILITADO=true`, `AMBIENTE_DEMONSTRACAO=true` e identidades privadas completas para ambos. São perfis híbridos Pessoa/Aluno/Conta/Funcionario porque a autenticação atual depende de Aluno. Usar banco isolado de demonstração.
- Provisionamento usa transação, trava PostgreSQL e unicidade. Não promove conta comum preexistente, não redefine senha, não reativa vínculo desativado e não duplica a matrícula. Configuração ausente não cria contas; identidade inválida ou conflito interrompe a inicialização.
- Administrador recebe apenas `administrador`: pode autenticar e consultar seu vínculo, mas não possui painel de concessão de privilégios. Gestor recebe apenas `gestao`: pode buscar alunos e autorizar a exceção diária já existente. Não confirma presença, não publica ficha e não concede papéis superiores.

## Catálogo e rotina

A nova tabela `exercicios` usa Sequelize/PostgreSQL. O código estável é único e independente do nome. Com `DEMO_CATALOGO_HABILITADO=true`, a inicialização insere 21 exemplos ausentes, em transação e com `ON CONFLICT DO NOTHING`. Não atualiza nem remove itens existentes, mesmo quando inativos ou renomeados.

`GET /api/v1/exercicios` recebe `busca`, `grupo`, `pagina` (a partir de 0) e `limite` (1–50; padrão 20). `GET /api/v1/exercicios/:id` retorna um item ativo. Ambas exigem sessão. Não há escrita pública no catálogo.

O editor oferece busca paginada, seleção e inclusão manual. A seleção preenche nome, equipamento e tipo; séries, meta, descanso e carga continuam escolhas do aluno. A rotina guarda o ID opcional do catálogo e seu próprio snapshot. Itens antigos sem ID continuam válidos. Referências existentes podem ser preservadas quando o catálogo é desativado; a lista para novas seleções mostra somente itens ativos.

São preservados: uma rotina pessoal atual por aluno, versões anteriores, confirmação de substituição, rejeição de edição concorrente, divisões/exercícios ordenáveis, validações de séries e duração, ciência de que a rotina pessoal não é prescrição e rascunho cifrado por aluno.

## Execução e histórico

- `GET /api/v1/treinos/configuracao` informa se novos treinos demonstrativos estão habilitados.
- `POST /api/v1/treinos/demonstracao` aceita somente rotina pessoal do aluno autenticado e exige `DEMO_TREINOS_HABILITADO=true` para novo início.
- `POST /api/v1/treinos` preserva o início oficial e a exigência de chegada. O corpo não pode convertê-lo em demonstração.
- Os dois caminhos usam a mesma transação, trava de aluno, restrição de uma sessão ativa, snapshot e serviços de séries/sincronização.
- `referencia.modo` guarda `demonstracao` ou `oficial` no JSONB existente. Registros anteriores sem campo mantêm sua origem oficial anterior; não houve atualização retroativa.
- Desligar a demonstração impede novos inícios, mas permite retomar, reenviar uma operação já aceita, sincronizar e finalizar sessões abertas.
- O histórico mostra data, rotina, divisão, referência, séries reais, carga, repetições/segundos, estado parcial/completo e rótulo de demonstração. Somente o dono consulta seus registros, salvo permissões operacionais específicas já existentes.
- O mecanismo existente de rascunho AES-GCM, chave por aluno no SecureStore, gravação antes de envio e recibos idempotentes foi reutilizado. O rascunho de execução só é apagado após encerramento confirmado.

## Navegação e escopo futuro

Expo Router continua em `src/app`. `src/navigation/destinos.js` centraliza destinos usados na navegação. Abas visíveis: Treinos, Histórico, Minha conta e Sobre. O menu é o primeiro destino autenticado; logout retira as rotas privadas. Sobre mantém dispositivo, preferência de vibração e aviso sobre retomada de rascunhos após novo login na mesma conta.

Chegada, assinatura e professor não são dependências da tela principal. Consulta de papéis da equipe falha separadamente sem bloquear a rotina. Área funcional só é oferecida quando a API retorna um vínculo; o Administrador vê a limitação atual do painel.

Planos/assinaturas/pagamentos, presença oficial pelo menu do aluno, medidas, gráficos, mídia e notificações administrativas ficam fora deste recorte. Arquivos, endpoints oficiais, fichas profissionais e lembretes anteriores foram preservados para continuidade. Não há rotina automática nem modelos AB/ABC pré-prescritos.

## Evidências e limites

- Backend: `npm run verificar` aprovado.
- Mobile: `npm run verificar` aprovado, incluindo ESLint e checagem do JavaScript/JSX.
- SDK 57 alinhado às correções recomendadas; `expo install --check` aprovado e Expo Doctor 21/21.
- Bundle Android/Hermes gerado com 1.381 módulos. Artefato local em `mobile/dist/demonstracao`, ignorado pelo Git; não é APK.
- 19 grupos de testes de serviços/HTTP local aprovados com modelos e transações simulados; bcrypt, JWT e Express reais. Testes adicionais de falha/conflito na migração de senha aprovados.
- Hook e utils mobile exercitados com React, rede e armazenamento simulados: perda de resposta, idempotência, séries acumuladas, correção/desmarcação, falha de armazenamento, descanso e limpeza somente após confirmação.
- API pública respondeu `API disponível.` na consulta de saúde. Isso não identifica a versão implantada nem prova que o catálogo novo existe no Neon.
- Sem validação de DDL, índices e concorrência real no PostgreSQL; sem homologação de SecureStore/AES, gestos, botão voltar ou retomada após encerrar o processo em dispositivo. Seguir o roteiro do relatório antes de apresentar o aplicativo como homologado.
