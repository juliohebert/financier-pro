-- Migração: Atualizar data_inicio_teste para usuários existentes
-- Data: 2026-01-17
-- Descrição: Define data_inicio_teste como data de criação (criado_em) 
--           para usuários que não têm esse campo preenchido

UPDATE usuarios
SET data_inicio_teste = criado_em
WHERE data_inicio_teste IS NULL 
  AND status_licenca = 'TESTE'
  AND funcao = 'USUARIO';

-- Verificar resultados
SELECT 
  id, 
  nome, 
  email, 
  status_licenca,
  TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI') as criado_em,
  TO_CHAR(data_inicio_teste, 'DD/MM/YYYY HH24:MI') as data_inicio_teste,
  EXTRACT(DAY FROM (NOW() - data_inicio_teste)) as dias_desde_inicio
FROM usuarios 
WHERE funcao = 'USUARIO'
ORDER BY criado_em DESC;
