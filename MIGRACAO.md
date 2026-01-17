# Migração de Data de Início do Teste

## Status
✅ Código commitado e enviado ao GitHub (commit 8186940)  
⏳ Aguardando deploy automático no Render (~3-5 minutos)

## O que foi feito

1. **Criado endpoint de migração** em `/migrations/fix-trial-dates`
   - Protegido com autenticação de administrador
   - Atualiza `data_inicio_teste = criado_em` para usuários em teste
   - Retorna detalhes de todos os usuários após a migração

2. **Script de execução automático** disponível em:
   - `backend/migrations/execute-migration.mjs`

## Como executar a migração

### Opção 1: Via Script (Recomendado)
```bash
cd backend
node migrations/execute-migration.mjs
```

O script vai:
1. Fazer login como admin
2. Executar a migração via API
3. Mostrar o resultado com status de todos os usuários

### Opção 2: Via curl
```bash
# 1. Fazer login e obter token
TOKEN=$(curl -s -X POST https://financier-ie3x.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@financier.pro","senha":"admin123"}' | \
  grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Executar migração
curl -X POST https://financier-ie3x.onrender.com/migrations/fix-trial-dates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Opção 3: Via Painel do Neon (Direto no banco)
1. Acesse: https://console.neon.tech/
2. Selecione o projeto "financier"
3. Vá em "SQL Editor"
4. Execute:
```sql
UPDATE usuarios
SET data_inicio_teste = criado_em
WHERE data_inicio_teste IS NULL 
  AND status_licenca = 'TESTE'
  AND funcao = 'USUARIO';

-- Verificar resultado
SELECT 
  id, nome, email, status_licenca,
  TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI') as criado_em,
  TO_CHAR(data_inicio_teste, 'DD/MM/YYYY HH24:MI') as data_inicio_teste,
  EXTRACT(DAY FROM (NOW() - data_inicio_teste)) as dias_desde_inicio
FROM usuarios 
WHERE funcao = 'USUARIO'
ORDER BY criado_em DESC;
```

## Aguarde o deploy

O Render está fazendo o deploy do código. Você pode:

1. **Aguardar ~3-5 minutos** e executar o script
2. **Verificar o status do deploy** em: https://dashboard.render.com/
3. **Testar se o endpoint está disponível**:
   ```bash
   curl -I https://financier-ie3x.onrender.com/migrations/fix-trial-dates
   ```

Quando o deploy estiver completo, execute:
```bash
cd backend
node migrations/execute-migration.mjs
```

## Resultado esperado

```
✅ Migração concluída com sucesso!

📊 Usuários atualizados: 1

Usuários modificados:
  - João (joao@email.com)

Status de todos os usuários:

  João (joao@email.com):
    - Criado em: 17/01/2026 15:30
    - Teste iniciado em: 17/01/2026 15:30
    - Dias desde início: 0
    - Dias restantes: 14
    - Status: TESTE
```

## Próximos passos

Após a migração:
1. ✅ Novos usuários já terão `data_inicio_teste` definido automaticamente
2. ✅ Usuários existentes terão a data corrigida
3. ✅ O cálculo dos dias restantes estará preciso no frontend
