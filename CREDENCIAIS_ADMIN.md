# 🔐 Credenciais de Acesso - Financier.pro

## Administrador (Super Admin)

### Acesso ao Painel Admin
- **URL:** https://financier-ks3x.onrender.com
- **Email:** `admin@financier.pro`
- **Senha:** `admin123`

⚠️ **IMPORTANTE:** Altere esta senha após o primeiro acesso!

---

## Como Criar/Atualizar o Usuário Admin

1. **Pelo Terminal (Recomendado):**
   ```bash
   cd backend
   node scripts/create-admin.js
   ```

2. **Diretamente no Banco de Dados:**
   Execute este SQL no Neon Dashboard:
   
   ```sql
   -- Senha: admin123
   INSERT INTO usuarios (nome, email, senha_hash, funcao, status_licenca, plano_licenca)
   VALUES (
     'Administrador', 
     'admin@financier.pro', 
     '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.VJhKEwzKcZPxGIJQqZgIzZMWvG8W',
     'ADMIN', 
     'ATIVO', 
     'Super Admin'
   )
   ON CONFLICT (email) 
   DO UPDATE SET 
     senha_hash = EXCLUDED.senha_hash,
     funcao = EXCLUDED.funcao,
     status_licenca = EXCLUDED.status_licenca,
     plano_licenca = EXCLUDED.plano_licenca;
   ```

---

## Painel Admin - Funcionalidades

Ao fazer login como admin, você terá acesso a:

- ✅ **Gestão de Usuários** - Ver todos usuários cadastrados
- ✅ **Aprovações de Pagamento** - Aprovar/Rejeitar pagamentos PIX
- ✅ **Métricas MRR** - Receita recorrente mensal
- ✅ **Controle de Licenças** - Ativar, suspender ou expirar licenças
- ✅ **Histórico de Pagamentos** - Ver todo histórico de cada usuário
- ✅ **Criar Novos Usuários** - Adicionar usuários diretamente pelo admin
- ✅ **Alterar Senhas** - Resetar senha de qualquer usuário
- ✅ **Configurar Preços** - Definir valores dos planos Mensal e Anual

---

## Usuários de Teste

Os usuários criados pelo sistema de registro terão:
- **Status:** `TESTE`
- **Período:** 14 dias de teste grátis
- **Acesso:** Dashboard completo durante o período de teste

Quando o usuário assinar um plano:
1. Status muda para `PENDENTE_APROVACAO`
2. Aparece no painel admin para você aprovar
3. Após aprovação → Status: `ATIVO`
4. Plano começa a contar

---

## Segurança

⚠️ **NUNCA COMPARTILHE ESTAS CREDENCIAIS**

Para maior segurança:
1. Altere a senha padrão imediatamente
2. Use senha forte (mínimo 12 caracteres)
3. Não compartilhe acesso admin
4. Monitore o painel regularmente

---

**Desenvolvido por:** Julio Hebert  
**WhatsApp:** (84) 9 9647-4171  
**PIX:** 84996474171
