# Backend da Academia

API em JavaScript, Express e Sequelize, com persistência exclusivamente no PostgreSQL do Neon. O backend não mantém banco local, cache de cadastros ou fila de gravações. As requisições de gravação só recebem sucesso depois da confirmação do Neon.

## Organização

O caminho é **rota → controller → service → repository → model**. As validações e funções auxiliares ficam em `utils`; a conexão e a preparação das tabelas ficam em `config`.

- `src/servidor.js`: autentica no Neon, prepara as tabelas e abre a porta HTTP.
- `src/config/banco.js`: lê `DATABASE_URL` e configura SSL, limites de tempo e conexões.
- `src/config/criar-tabelas.js`: cria apenas as tabelas ausentes.
- `src/services/persistencia-servico.js`: encaminha consultas e gravações ao repositório online.
- `src/repositories/operacao-online.js`: grava os dados e o recibo da operação na mesma transação.
- `src/repositories/aluno-repositorio.js`: faz busca, paginação e consulta de alunos no banco.
- `src/models`: define pessoas, alunos, lembretes, planos, modalidades e operações recebidas.

Uso `sync()` sem `force` e sem `alter`: tabelas existentes e seus dados são preservados. Esse comando não corrige colunas de uma estrutura antiga. Mudanças desse tipo precisam de planejamento próprio.

## Configurar no Render

Crie ou configure um **Web Service** com estes valores:

| Campo | Valor |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `npm ci --include=dev && npm run verificar` |
| Start Command | `npm start` |
| Health Check Path | `/api/v1/saude` |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | URL privada copiada do painel do Neon |

Não há compilação nem script `build` neste backend. A instalação e o ESLint são suficientes para a etapa de build. Incluo as dependências de desenvolvimento para executar o ESLint mesmo com `NODE_ENV=production`.

O servidor prioriza `PORT`, fornecida pelo Render. `PORTA` continua aceita quando `PORT` está ausente; o padrão é 3000. Em produção ou no Render, o endereço é `0.0.0.0`, mesmo se houver um `HOST` antigo apontando para `127.0.0.1`.

O `package.json` limita o Node às versões 24 até 26. Uma variável `NODE_VERSION` no painel do Render tem precedência; mantenha-a nessa faixa. Não foi necessário trocar bibliotecas para corrigir o erro de importação.

Referências: [configuração de Web Services e portas](https://render.com/docs/web-services), [verificações de saúde](https://render.com/docs/health-checks) e [versão do Node](https://render.com/docs/node-version).

## Conexão com o Neon

Defina `DATABASE_URL` nas variáveis de ambiente do backend, sem incluir aspas, comandos de shell ou o prefixo `DATABASE_URL=` no valor do campo do Render. Use a URL completa fornecida pelo Neon; o endereço com `-pooler` é aceito.

O backend valida protocolo PostgreSQL, host do Neon, banco, usuário, senha e porta. A conexão exige SSL com verificação do certificado. A URL pode manter `sslmode=require&channel_binding=require`. Nesta versão, o Sequelize 6 não repassa a opção de channel binding ao driver; a proteção configurada pelo backend é TLS com validação do certificado.

A abertura de cada conexão tem limite de dez segundos, assim como cada instrução SQL. O pool usa até cinco conexões e espera até quinze segundos por uma conexão livre. Erros não imprimem a URL, a senha ou o SQL.

Sem configuração válida, conexão ou permissão para preparar as tabelas, o processo termina com erro antes de receber requisições. O endpoint de saúde também consulta o Neon; se o banco ficar indisponível depois do início, a API informa a falha.

Referências: [Node.js com Neon](https://neon.com/docs/guides/node) e [SSL e channel binding no pg](https://node-postgres.com/features/ssl).

## Executar no computador

1. Instale as dependências com `npm ci`, dentro de `backend`.
2. Defina `DATABASE_URL` no ambiente. Se desejar usar um arquivo local por conta própria, tome `.env.example` como referência; não versione credenciais.
3. Execute `npm run dev`. Esse comando lê `.env` somente quando o arquivo existe. `npm start` usa as variáveis fornecidas pelo ambiente, como no Render.

Mesmo executado no computador, o backend usa o Neon. O endereço HTTP padrão é `http://127.0.0.1:3000/api/v1`. Em desenvolvimento, `HOST` permite escolher a interface de rede.

## Endpoints e respostas

Todos os caminhos abaixo usam o prefixo `/api/v1`.

| Método | Caminho | Uso |
| --- | --- | --- |
| GET | `/saude` | Confere a API e a conexão com o Neon. |
| POST | `/alunos` | Cadastra pessoa e aluno na mesma transação. |
| GET | `/alunos?pagina=1&limite=20&busca=Ana` | Busca por nome ou matrícula e pagina no banco. |
| GET | `/alunos/:id` | Consulta um aluno por UUID. |
| GET | `/catalogo/:categoria` | Lista `plano` ou `modalidade`. |
| PUT | `/catalogo/:categoria/:id` | Cria ou edita um item do catálogo. |
| GET | `/lembretes` | Lista os lembretes da instalação indicada. |
| POST | `/lembretes` | Salva um lembrete no Neon. |
| DELETE | `/lembretes/:id` | Exclui um lembrete da instalação indicada. |

Envie JSON nas gravações. As requisições não exigem senha ou chave de desenvolvimento. `Idempotency-Key` é opcional e aceita um UUID v4 para reconhecer reenvios: o mesmo ID com os mesmos dados recupera a resposta já salva no Neon; dados diferentes com o mesmo ID geram 409. Sem esse cabeçalho, o backend gera o ID, mantendo a compatibilidade com o mobile.

Os lembretes usam `X-Aparelho-ID` com um UUID v4. Ele identifica uma instalação; não substitui autenticação. Para editar um catálogo existente, envie `versaoAnterior` com o `atualizadoEm` recebido na consulta.

Cadastro de aluno:

```json
{
    "nome": "Aluna de Exemplo",
    "cpf": "529.982.247-25",
    "dataNascimento": "2000-01-15",
    "email": "aluna@example.com",
    "telefone": "(11) 99999-1234"
}
```

Nome, CPF, nascimento, e-mail e telefone são obrigatórios. `fotoUrl` HTTPS e `contatoEmergencia` com nome e telefone são opcionais. As validações existentes de CPF e idade continuam no backend. O cadastro não cria login, assinatura, pagamento ou treino.

As respostas de gravação e detalhe contêm `dados`; a listagem de alunos também contém `pagina`, `total` e `totalPaginas`. A matrícula vem da sequência PostgreSQL e é apresentada como `A000001`. A listagem consulta apenas as colunas do resumo e usa vinte itens por padrão, até cem.

O cadastro de aluno retorna 201; as outras operações bem-sucedidas retornam 200. Erros de validação retornam 422, conflitos retornam 409, registros ausentes retornam 404 e indisponibilidade de conexão retorna 503. Falhas inesperadas retornam 500. Uma falha de comunicação durante a confirmação pode deixar o resultado incerto: consulte os dados antes de repetir ou reutilize a mesma chave de idempotência.

As rotas antigas `/sincronizacao` foram removidas, assim como as respostas de gravação pendente. Nenhuma gravação é guardada em fila local.

## Bloqueio temporário em produção

As rotas de alunos, catálogo e lembretes continuam bloqueadas com 503 em produção ou quando `RENDER=true`, até a implementação de login e autorização reais. O endpoint `/api/v1/saude` fica disponível para o Render verificar o deploy.

Esse bloqueio não indica falha de deploy. Não use uma rota de alunos como health check e não mude o ambiente para desenvolvimento para liberar os dados publicamente.

O mobile recebe somente a URL HTTPS pública da API, nunca `DATABASE_URL`. CORS de navegador não está configurado; o cliente atual é React Native nativo.

## Diagnosticar e verificar

| Sintoma | Conferência |
| --- | --- |
| `ERR_MODULE_NOT_FOUND` | Confira se o commit contém todos os arquivos importados; as referências aos modelos locais foram removidas. |
| `npm ci` falha | Confira `package.json` e `package-lock.json`; o lock precisa ser JSON válido e estar atualizado. |
| Porta não detectada | Confira `PORT`, a mensagem de início e o endereço `0.0.0.0`. |
| Autenticação recusada | Confira usuário e senha em `DATABASE_URL`. |
| Falha SSL | Confira o endereço e os certificados do ambiente; mantenha a validação SSL ativa. |
| Falha de permissão | O usuário do Neon precisa poder preparar e acessar as tabelas. |
| Tabela ou coluna ausente | Compare a estrutura existente com os modelos; `sync()` não altera tabelas existentes. |
| 503 em `/saude` | Confira a disponibilidade e a conexão com o Neon. |
| 503 nas rotas de dados em produção | Bloqueio esperado enquanto login e permissões estão pendentes. |

Execute `npm run verificar` antes de concluir mudanças. Esse comando executa apenas ESLint; não acessa o banco nem comprova um deploy no Render. Não há arquivos de teste permanentes ou scripts de migração.

## Verificações desta revisão de deploy

- Instalação limpa com `npm ci` e execução de `npm run verificar` aprovadas no Node 26.1.0.
- Imports dos 33 arquivos JavaScript do backend conferidos, sem referências a arquivos ausentes.
- Inicialização simulada: preparação das seis tabelas antes da abertura HTTP, prioridade de `PORT`, endereço público no Render e encerramento com erro para porta ou URL inválidas.
- Chamadas HTTP reais ao Express com persistência simulada em memória: cadastro sem cabeçalho extra, CPF duplicado, listagem, detalhe, reenvio, reversão de cadastro, edição de catálogo, lembretes, bloqueio de produção e indisponibilidade do banco.
- O endereço fornecido do Neon resolveu no DNS, mas a conexão TCP à porta 5432 expirou neste ambiente, inclusive fora do sandbox. Não foi possível validar autenticação, certificado ou estrutura real do banco. Nenhum dado ou tabela foi alterado.

Essas verificações não confirmam um deploy no Render. Depois de enviar as alterações ao repositório, confira o log até a mensagem de API disponível e a resposta de `/api/v1/saude` na URL pública.
