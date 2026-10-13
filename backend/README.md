# Backend da Academia

Esta etapa contém apenas a base da API e o cadastro, a listagem e a consulta de alunos. Uso JavaScript, Express, Sequelize e PostgreSQL no Neon.

## Como ler o código

O caminho principal é **rota → controller → service → repository → model → banco**. Cada arquivo tem uma responsabilidade, usando funções diretas.

| Arquivo ou pasta | O que faz |
| --- | --- |
| `src/servidor.js` | Conecta ao banco, aguarda a criação das tabelas e inicia o servidor. |
| `src/aplicacao.js` | Configura o Express e o tratamento básico de erros. |
| `src/config/banco.js` | Lê a conexão privada do ambiente. |
| `src/routes/aluno-rotas.js` | Define os endereços de cadastro e consulta. |
| `src/controllers/aluno-controlador.js` | Recebe o pedido HTTP, chama o serviço e envia a resposta. |
| `src/services/aluno-servico.js` | Coordena validações, regras do cadastro e preparação dos resultados. |
| `src/repositories/aluno-repositorio.js` | Faz consultas e gravações no banco, incluindo a transação do cadastro. |
| `src/models` | Descreve pessoa, aluno e seu relacionamento. |
| `src/config/criar-tabelas.js` | Cria as tabelas ausentes a partir dos modelos Sequelize. |
| `src/utils/validar-*.js` | Confere campos, CPF, idade e parâmetros de consulta. |
| `src/utils/formatar-aluno.js` | Escolhe os dados devolvidos ao frontend. |
| `src/middlewares/disponibilidade-alunos.js` | Mantém o bloqueio temporário das rotas de alunos em produção. |

Comece pela rota `POST /`, que chama `cadastrarAluno` no controller. Ele verifica o formato HTTP e encaminha o corpo ao service. O service valida os dados e solicita o cadastro. O repository salva pessoa e aluno na mesma transação: se uma gravação falhar, a outra também é desfeita. A restrição única de CPF no banco impede duplicidade, inclusive em pedidos simultâneos, sem uma consulta prévia repetida.

Os problemas previstos voltam do service como um objeto simples com `erro` e `mensagem`. O controller transforma esse resultado em uma resposta HTTP; os detalhes internos não são enviados ao frontend. `utils` reúne a apresentação dos dados e as validações. A criação das tabelas fica em `config`, deixando `models` apenas com as entidades. As URLs e as respostas da API permanecem iguais.

Não há fábricas de funções, classes próprias de erro ou scripts de geração. Os comentários explicam a intenção em primeira pessoa. O código usa quatro espaços de indentação, sem ternários, `for`, `forEach`, `?.` ou `??`.

## Preparar o ambiente

1. Crie `backend/.env` copiando `.env.example` quando quiser executar o projeto.
2. Preencha `DATABASE_URL` com a conexão privada do Neon. As requisições da API não exigem senha ou chave de desenvolvimento.
3. Dentro de `backend`, execute `npm run dev`. O JavaScript cria as tabelas pelo Sequelize antes de abrir a API.

As dependências já estão instaladas neste computador. Em uma nova cópia do projeto, use `npm ci`. O Node lê o `.env` ao iniciar, sem biblioteca adicional.

O banco PostgreSQL precisa existir no Neon; sua conexão entra em `DATABASE_URL`. O backend cria a estrutura dentro desse banco, sem precisar executar SQL manualmente. Os modelos JavaScript são a definição dessa estrutura:

- `pessoa.js` define a tabela `pessoas`, com UUID e CPF único.
- `aluno.js` define a tabela `alunos`, com UUID e vínculo único com uma pessoa.
- `numeroMatricula` usa `autoIncrement`: o Sequelize cria uma sequência no PostgreSQL. A API apresenta o número como `A000001`, `A000002` e assim por diante.

Uso [`sync()` do Sequelize](https://sequelize.org/docs/v6/core-concepts/model-basics/#model-synchronization) sem `force` e sem `alter`. Ele cria as tabelas ausentes, preserva os dados e não modifica as colunas das tabelas existentes. Alterações futuras na estrutura serão planejadas separadamente. Se você já executou o SQL anterior, a sequência existente continua atendendo aos cadastros.

Sem `.env` ou uma conexão válida, o servidor não inicia. A conexão real com o Neon depende das credenciais locais; elas não foram fornecidas nem testadas aqui. Não coloque a senha do banco no app mobile.

## Usar a API

Endereço local: `http://127.0.0.1:3000/api/v1`.

| Método | Caminho | Uso |
| --- | --- | --- |
| GET | `/saude` | Confere se a API está respondendo. |
| POST | `/alunos` | Cadastra pessoa e aluno. |
| GET | `/alunos?pagina=1&limite=20` | Lista uma página de alunos. |
| GET | `/alunos?busca=Ana` | Busca por parte do nome. |
| GET | `/alunos?busca=A000001` | Busca pela matrícula completa. |
| GET | `/alunos/:id` | Consulta um aluno pelo UUID retornado no cadastro. |

No cadastro, envie `Content-Type: application/json`. Não é necessário enviar senha ou chave em nenhum cabeçalho.

```json
{
    "nome": "Aluna de Exemplo",
    "cpf": "529.982.247-25",
    "dataNascimento": "2000-01-15",
    "email": "aluna@example.com",
    "telefone": "(11) 99999-1234"
}
```

Todos esses campos são obrigatórios. `fotoUrl` (URL HTTPS) e `contatoEmergencia` (objeto com `nome` e `telefone`) são opcionais. Não há upload de imagem nesta etapa. Use dados fictícios durante o desenvolvimento.

A validação exige CPF válido e 18 anos completos. A idade usa o calendário de Brasília; para nascimento em 29/02, considera 01/03 nos anos sem essa data. A verificação matemática do CPF não comprova a identidade. CPF já existente retorna conflito, sem vincular automaticamente outra pessoa. Matrículas vêm da sequência do banco; lacunas são normais. O cadastro não cria login, plano, pagamento ou ficha de treino.

As respostas foram simplificadas:

- Cadastro e detalhe: `{ "dados": { ... } }`.
- Listagem: `{ "dados": [], "pagina": 1, "total": 0, "totalPaginas": 0 }`.
- Erro: `{ "mensagem": "Descrição do problema." }`.

O cadastro retorna HTTP 201. Dados inválidos retornam 422, CPF duplicado retorna 409 e aluno ausente retorna 404. Falhas inesperadas retornam 500 com mensagem genérica, sem expor SQL ou credenciais. O frontend pode usar `resposta.ok` e ler `mensagem` quando houver erro.

Cada item da listagem contém `id`, `matricula`, `nome`, `ativo` e `criadoEm`. O detalhe acrescenta CPF, nascimento, contatos e demais dados do cadastro. O limite padrão é 20, com máximo de 100. A busca por nome não diferencia maiúsculas e minúsculas, mas preserva acentos.

A consulta da lista busca apenas as colunas usadas no resumo. O mobile aproveita o limite padrão informado aqui e usa `totalPaginas` na navegação. As regras de CPF, idade e unicidade permanecem no backend; as conferências do formulário servem somente para orientar o preenchimento.

As requisições locais não exigem autenticação nesta etapa. As rotas de alunos continuam bloqueadas com `NODE_ENV=production` até a implementação de login e autorização, conforme as convenções do projeto. `DATABASE_URL` é usada apenas na conexão entre o backend e o Neon; ela não deve ser enviada pelo frontend.

Para acessar pelo celular, configure `HOST=0.0.0.0` e use o IP do computador na rede local. No celular, `localhost` representa o próprio aparelho. CORS de navegador não está configurado, pois o escopo atual é React Native nativo.

## Conferir o código

Execute `npm run verificar` para conferir sintaxe, indentação e operadores proibidos. Não há arquivos de testes locais nesta etapa, e essa verificação não acessa o Neon.

As dependências continuam fixadas no arquivo de lock. Permanecem os dois alertas moderados já identificados na dependência `uuid` do Sequelize; não foi aplicado o rebaixamento incompatível sugerido pelo npm.
