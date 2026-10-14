# Implementação do fluxo de treino

Data: 14/10/2026. Referência: Documentacao_Academia.pdf, versão 2.0, e MAPEAMENTO_PENDENCIAS.md.

Este registro complementa o diagnóstico original. Descreve código local; não significa que o Render ou o aplicativo instalado já foram atualizados.

## O que foi implementado

- Entrada do aplicativo em **Treinos**, com chegada do dia, rotina pessoal, ficha recomendada e retomada. Perfil em **Minha conta**; execuções em **Histórico**.
- Rotina pessoal com divisões e exercícios ordenáveis, equipamento, referência de carga, séries, repetições ou segundos, carga opcional, descanso e observações.
- Cópia independente da recomendada, aviso de orientação e confirmação antes de substituir a rotina pessoal.
- Versões preservadas no servidor, com detecção de edição concorrente. Alterações da rotina não modificam uma sessão já iniciada.
- Uma sessão ativa por aluno, com restrição no banco e serialização das alterações do mesmo aluno em transação.
- Modo guiado por exercício e lista completa sobre a mesma execução.
- Marcação, correção e desmarcação de séries durante o treino, sem preencher automaticamente resultados sugeridos.
- Descanso ajustável por horário final; conclusão completa ou parcial calculada pela API.
- Histórico paginado de sessões confirmadas, com detalhes de carga, repetições/duração e distinção de sessões parciais.
- Rascunho do treino e da edição da rotina pessoal cifrado com AES-GCM no aparelho. A chave fica no SecureStore, separada por aluno.
- Salvamento local antes do envio. Uma operação sem resposta conserva seu identificador e conteúdo; novas séries permanecem separadas até o reenvio ser reconhecido.
- Tentativa de sincronização ao abrir a execução, voltar ao primeiro plano, tocar em sincronizar e a cada 30 segundos enquanto a tela está aberta. Não há promessa de sincronização em segundo plano.
- O rascunho de treino só é removido após confirmação do encerramento no servidor. Uma falha de armazenamento impede o envio da nova alteração.
- Retomada limitada sem rede quando já existe credencial e identidade mínima protegidas no aparelho. Uma resposta 401 exige novo login. O cache não substitui a autenticação da API.
- Área de equipe baseada em vínculo ativo consultado no servidor, sem seletor público de privilégios.
- Instrutor: busca por nome/matrícula, rascunho de ficha, publicação explícita, autoria/data/versão e histórico paginado, com vinte treinos por página.
- Acompanhamento com atualização própria, sem recarregar o rascunho da ficha. Os detalhes comparam a meta original de cada exercício com as séries, cargas e repetições/segundos realizados.
- Nova tentativa de carregar a ficha e de recuperar a execução quando a consulta falha. Falha de rede não é apresentada como confirmação de que não há treino ativo.
- Proteção contra dois toques imediatos ao iniciar; a tela reconhece a sessão aberta mesmo se a cópia local falhar. A recepção confere novamente se o aluno está ativo ao confirmar sua chegada.
- Interrupção dos reenvios consecutivos quando falha a gravação da resposta no aparelho; a operação original e as séries novas ficam disponíveis para outra tentativa.
- Gestão: autorização excepcional de entrada para o dia, com motivo. Recepção: consulta da autorização e confirmação presencial separada.

Os lembretes saíram do menu principal. Seus arquivos, rotas e dados existentes foram preservados; não houve exclusão de registros antigos.

## Caminho mínimo de entrada

O início do treino continua exigindo chegada confirmada, conforme o capítulo 18. Como o módulo de assinaturas ainda não existe, esta entrega usa **somente a exceção diária do capítulo 11**:

1. O aluno solicita sua chegada pelo aplicativo, ou a Gestão localiza seu cadastro.
2. A Gestão autoriza a exceção para o dia, informando o motivo.
3. A Recepção confere a identidade e confirma a presença física.
4. O aluno atualiza a tela Treinos e inicia uma divisão.

Uma exceção não representa pagamento, assinatura ou cobertura recorrente. O dia operacional usa `America/Sao_Paulo`. A autorização e a confirmação são preservadas com responsável e horário; não existe endpoint de alteração retroativa.

## Como ativar no ambiente

1. Atualizar o backend com este código e as variáveis já utilizadas pelo projeto. A URL privada do Neon permanece exclusivamente no ambiente do backend.
2. Iniciar a API. `config/criar-tabelas.js` cria as tabelas novas com `sync()`, sem `force` ou `alter`: `rotinas`, `treinos`, `funcionarios`, `chegadas` e `rascunhos_ficha`.
3. Criar as contas necessárias pelo fluxo de cadastro existente e conferir as identidades antes de conceder qualquer papel.
4. Vincular manualmente a equipe no banco, usando acesso administrativo já autorizado ao Neon. Não há conta de equipe, senha padrão ou permissão inserida automaticamente.
5. Executar as verificações e gerar uma nova versão do mobile apontando para a API atualizada. `EXPO_PUBLIC_API_URL` continua terminado em `/api/v1`.

Exemplo **manual** de concessão, a executar somente depois de substituir e conferir o e-mail. O exemplo não foi executado pela implementação:

```sql
SELECT id, email, aluno_id
FROM contas
WHERE email = 'email-da-conta-conferida';

INSERT INTO funcionarios
    (conta_id, papeis, ativo, criado_em, atualizado_em)
SELECT id, '["instrutor"]'::jsonb, true, NOW(), NOW()
FROM contas
WHERE email = 'email-da-conta-conferida'
ON CONFLICT (conta_id) DO UPDATE
SET papeis = EXCLUDED.papeis,
    ativo = true,
    atualizado_em = NOW();
```

Papéis usados neste fluxo: `instrutor`, `recepcao` e `gestao`. Conceder apenas os necessários. Uma pessoa pode acumular papéis, por exemplo `["instrutor", "recepcao", "gestao"]`, quando isso corresponder às suas funções reais. `administrador` é reconhecido como papel, mas não substitui automaticamente os três anteriores.

Para revogar o acesso funcional, alterar `funcionarios.ativo` para `false` ou retirar o papel. As próximas requisições releem o vínculo. O status da conta e do aluno também continua sendo conferido pela autenticação existente.

Nesta primeira implementação, a equipe usa uma conta que já tem cadastro de aluno. A matrícula funcional F é representada pelo número próprio de `funcionarios`, mas cadastro independente de funcionário, exibição dessa matrícula e administração de vínculos pela interface continuam pendentes. Os endpoints genéricos antigos de equipe permanecem bloqueados; somente as novas ações recebem permissões específicas.

## Verificações executadas

- `npm run verificar` no backend: ESLint.
- `npm run verificar` no mobile: ESLint e checagem de tipos do JavaScript/JSX.
- Verificações executadas em memória, sem criar arquivos de teste: rotina vazia/série inválida, isolamento por aluno, edição concorrente, início sem chegada, permissões por função, revogação, publicação separada do rascunho, preservação da referência inicial, idempotência e conclusão parcial/completa.
- Verificação da lógica de sincronização mobile com dependências simuladas: perda de resposta após recebimento, novas séries acumuladas, reenvio da mesma operação, falha do armazenamento antes do envio e limpeza somente após confirmação.
- Smoke HTTP local das rotas: autenticação obrigatória, respostas 403 para aluno sem função e 422 para entradas inválidas, usando modelos simulados.
- Exportação Android com Metro e Hermes concluída. Isso verifica a geração do bundle, não a instalação nem a execução das funções nativas no telefone.

As verificações em memória não substituem testes de transações/índices no PostgreSQL, de SecureStore/AES em dispositivos ou das interfaces no Android/iOS. Nenhuma alteração foi aplicada ao Neon ou ao Render durante estas verificações.

Na revisão de continuidade, os serviços e repositórios reais também foram exercitados com persistência simulada: publicação, escolha das duas origens de rotina, chegada autorizada/confirmada, recusa de aluno inativo, isolamento entre contas, preservação da ficha inicial, início repetido, reenvio, conflito de revisão, série duplicada, encerramento parcial/completo e paginação do instrutor. O hook de execução foi verificado com React, rede e armazenamento simulados, incluindo falha ao gravar a resposta, preservação de séries novas, falha na limpeza e nova tentativa de recuperação. Esses testes não gravaram dados de teste no Neon.

## Roteiro de validação no dispositivo

1. Entrar como aluno sem ficha: não deve receber rotina genérica nem autorização automática.
2. Criar uma rotina pessoal com exercícios por repetições e por duração; salvar e reabrir.
3. Tentar iniciar sem chegada: o botão deve orientar a confirmação e a API deve rejeitar tentativas diretas.
4. Autorizar a exceção pela Gestão e confirmar pela Recepção. Um aluno sem vínculo não pode executar essas ações.
5. Publicar ficha pelo Instrutor e conferir a mesma conta de aluno. Salvar rascunho sozinho não deve mudar a ficha publicada.
6. Iniciar uma divisão, marcar séries, corrigir/desmarcar e alternar os modos. Resultados não marcados não devem aparecer como realizados.
7. Editar a rotina após iniciar: a sessão deve manter os exercícios e parâmetros anteriores.
8. Desligar a rede durante um treino; marcar mais séries; fechar/reabrir o aplicativo; restaurar a rede e sincronizar. Conferir ausência de duplicações.
9. Encerrar parcialmente e depois concluir outra sessão integralmente. Conferir histórico e detalhes no aluno e no instrutor.
10. Sair e entrar em outra conta: não deve aparecer o rascunho da primeira. O rascunho pendente permanece cifrado e isolado para a conta original.
11. Usar dois aparelhos: tentar começar dois treinos e salvar versões concorrentes. Conflitos devem ser identificados, sem sobrescrita silenciosa.
12. Revogar o papel no banco: novas ações da equipe devem receber 403.
13. No acompanhamento do instrutor, atualizar após o aluno encerrar um treino, abrir os detalhes e comparar planejado/realizado. Com mais de vinte sessões, navegar pelas páginas. Atualizar o acompanhamento não deve apagar o rascunho da ficha.
14. Abrir a execução sem rede e sem rascunho: deve aparecer a falha com opção de tentar novamente, sem afirmar que não existe sessão. Restaurar a conexão e repetir a recuperação.

## Pendências que não foram declaradas prontas

- Assinaturas, planos com cobertura, pagamentos, tolerância, benefícios e fluxo regular de entrada por cobertura; fila geral de recepção.
- Cadastro independente e gestão de funcionários, recuperação de senha, biometria e política de inatividade funcional.
- Catálogo oficial/local de exercícios com busca e mídia revisada, modelos privados e estruturas-base curadas. Nesta entrega os exercícios são descritos diretamente na ficha/rotina; não há conteúdo técnico inventado ou prescrição automática.
- Central de notificações e push de nova ficha. A ficha publicada aparece na consulta/atualização de Treinos.
- Tela de auditoria com diferenças entre versões e restauração, exclusão de rotina pessoal e correções após encerramento da sessão.
- Resolução assistida de conflitos de execução entre aparelhos: a API rejeita a revisão antiga e o app conserva o rascunho, sem mesclar automaticamente.
- Gráficos de evolução, comparação por exercício entre sessões, peso/altura e compartilhamento dessas medidas.
- Cache de leitura das rotinas publicadas fora da execução. O recorte local atual preserva a sessão em andamento e o rascunho pessoal.
- Homologação em dispositivos Android/iOS, teste com PostgreSQL real, deploy e distribuição de APK.

Limites técnicos desta implementação: até 10 divisões, 30 exercícios por divisão, 20 séries por exercício, corpo da API de até 128 KB e rascunho local de até 256 KB. São limites de armazenamento/validação, não novas regras acadêmicas do PDF. A API informa quando a entrada é inválida; o aplicativo não deve anunciar confirmação quando uma gravação falhar.
