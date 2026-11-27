# Especificação de Segurança Firestore — Arquivo Cifra

## 1. Invariantes de Dados
1. **Isolamento de PII (`users/{userId}`)**: Nenhum usuário autenticado pode ler, listar, criar, atualizar ou remover o perfil de outro usuário (`userId != request.auth.uid`). Leituras globais (`allow list`) na coleção `/users` são estritamente proibidas.
2. **Integridade de Identidade**: O campo `uid` no documento deve corresponder exatamente a `request.auth.uid` e ao segmento de caminho `{userId}`, permanecendo imutável após a criação.
3. **Verificação de E-mail**: Operações de leitura e escrita autenticadas exigem `request.auth.token.email_verified == true`.
4. **Master Gate em Subcoleções (`users/{userId}/progress/{progressId}`)**: Qualquer gravação ou leitura na subcoleção `progress` verifica que o documento pai `/users/{userId}` existe e pertence a `request.auth.uid`, além de exigir `progressId == 'main'`.
5. **Chaves Estritas & Sem Campos Fantasmas**: Criação exige `hasAll` e `hasOnly` com exatamente os campos declarados no blueprint; atualizações exigem `affectedKeys().hasOnly(...)` e rejeitam alteração de `createdAt` ou `uid`.
6. **Integridade Temporal**: `createdAt` (na criação) e `updatedAt` (na criação e atualização) devem igualar `request.time`.
7. **Guarda de Arrays e Limites**: `solvedIds` tem limite máximo de 20 itens (`size() <= 20`) e validação de tipo string no primeiro elemento quando não vazio; `hintsUsedByLevel` tem limite de 20 chaves (`size() <= 20`).
8. **RBAC de Administrador (`admins/{userId}`)**: O e-mail verificado `20261ac0080020@estudantes.ifpr.edu.br` (`isBootstrappedAdmin()`) ou documentos verificados em `/admins/{uid}` detêm acesso administrativo (`isAdmin()`). Nunca confia em claims ou nomes vindos do cliente. Somente administradores verificados podem conceder/revogar acesso admin ou atualizar `/announcements/banner`.

## 2. Payloads "Dirty Dozen" (Devem resultar em `PERMISSION_DENIED`)
1. **Leitura não autenticada**: `get(/users/uid1)` sem `request.auth` → `PERMISSION_DENIED`.
2. **Listagem global de usuários**: `list(/users)` por usuário comum → `PERMISSION_DENIED`.
3. **Acesso cruzado de PII**: Usuário `uid2` tentando `get(/users/uid1)` → `PERMISSION_DENIED`.
4. **Spoofing de UID na criação**: Usuário `uid1` criando `/users/uid1` com `{ uid: "uid2", ... }` → `PERMISSION_DENIED`.
5. **Usuário não verificado**: Usuário com `email_verified: false` tentando criar `/users/uid1` → `PERMISSION_DENIED`.
6. **Campo fantasma (Shadow Field) na criação**: `/users/uid1` contendo `{ ..., isAdmin: true }` → `PERMISSION_DENIED`.
7. **ID inválido / Resource Poisoning**: Caminho `/users/a...200chars` ou com caracteres inválidos → `PERMISSION_DENIED`.
8. **Timestamp forjado pelo cliente**: `/users/uid1` com `createdAt` diferente de `request.time` → `PERMISSION_DENIED`.
9. **Alteração de campo imutável**: `update(/users/uid1)` tentando mudar `uid` ou `createdAt` → `PERMISSION_DENIED`.
10. **Subcoleção órfã ou ID arbitrário**: Criar `/users/uid1/progress/outro` quando pai não existe ou `progressId != 'main'` → `PERMISSION_DENIED`.
11. **Array ilimitado (Denial of Wallet)**: Criar progresso com `solvedIds` contendo 25 itens → `PERMISSION_DENIED`.
12. **Envenenamento de tipo no update**: Atualizar `endlessSolvedCount` com string `"999"` ou número negativo `-5` → `PERMISSION_DENIED`.
13. **Escalada de privilégio por jogador comum**: Jogador comum tentando criar `/admins/{uid}` ou editar `/announcements/banner` → `PERMISSION_DENIED`.

