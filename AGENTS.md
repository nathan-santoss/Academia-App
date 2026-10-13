# Convenções do projeto

- Escreva o código próprio em JavaScript/JSX, com nomes claros em português.
- Não use operadores ternários, `for`, `for...in`, `for...of` ou `forEach`.
- Prefira funções pequenas e arquivos com uma responsabilidade bem definida.
- Priorize código introdutório com a organização aprovada: rota chama controller, controller chama service, service aplica regras e chama repository, repository acessa os models. Mantenha funções auxiliares e validações em utils. Deixe a preparação dos bancos em config e reserve models para definir entidades. Use funções diretas, sem fábricas ou classes desnecessárias; não acrescente geradores, scripts de migração ou infraestrutura sem solicitação.
- Use indentação de quatro espaços no backend, propriedades em linhas separadas e verificações explícitas com if/else. Evite optional chaining (`?.`) e nullish coalescing (`??`) e (`...`) para facilitar a leitura.
- Escreva comentários úteis em primeira pessoa, variando a palavra inicial. Explique a intenção e as regras; não comente imports.
- Não implemente regras pendentes do PDF por suposição.
- Mantenha credenciais fora dos arquivos versionados e do aplicativo mobile.
- No backend, execute `npm run verificar` antes de concluir mudanças.
- Mantenha apenas `.env.example` versionado; não crie `.env`, arquivos de teste ou `.gitkeep` sem nova solicitação do usuário. O comando `verificar` confere somente o código com ESLint nesta fase.
- Não exija senha ou chave de desenvolvimento nas requisições da API. Mantenha o bloqueio das rotas de alunos em produção até implementar login e autorização reais.
