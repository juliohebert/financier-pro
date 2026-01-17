-- ========================================
-- MIGRAÇÃO: Corrigir data_inicio_teste
-- Execute este script no Neon Console
-- https://console.neon.tech/
-- ========================================

-- Atualizar usuários existentes sem data_inicio_teste
UPDATE usuarios
SET data_inicio_teste = criado_em
WHERE data_inicio_teste IS NULL 
  AND status_licenca = 'TESTE'
  AND funcao = 'USUARIO';

-- Verificar resultado da migração
SELECT 
  id, 
  nome, 
  email, 
  status_licenca,
  TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI') as criado_em,
  TO_CHAR(data_inicio_teste, 'DD/MM/YYYY HH24:MI') as data_inicio_teste,
  (NOW()::date - data_inicio_teste::date) as dias_desde_inicio,
  (14 - (NOW()::date - data_inicio_teste::date)) as dias_restantes
FROM usuarios 
WHERE funcao = 'USUARIO'
ORDER BY criado_em DESC;
