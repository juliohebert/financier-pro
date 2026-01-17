-- Verificar TODOS os usuários e seus valores reais
SELECT 
  id,
  nome,
  email,
  funcao,
  status_licenca,
  plano_licenca,
  data_inicio_teste IS NULL as data_teste_null,
  TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI') as criado_em,
  TO_CHAR(data_inicio_teste, 'DD/MM/YYYY HH24:MI') as data_inicio_teste
FROM usuarios 
ORDER BY criado_em DESC;

-- Forçar update em TODOS os usuários com data_inicio_teste NULL
UPDATE usuarios
SET data_inicio_teste = criado_em
WHERE data_inicio_teste IS NULL;

-- Verificar resultado final
SELECT 
  id,
  nome,
  email,
  funcao,
  status_licenca,
  TO_CHAR(criado_em, 'DD/MM/YYYY HH24:MI') as criado_em,
  TO_CHAR(data_inicio_teste, 'DD/MM/YYYY HH24:MI') as data_inicio_teste,
  (NOW()::date - data_inicio_teste::date) as dias_desde_inicio,
  (14 - (NOW()::date - data_inicio_teste::date)) as dias_restantes
FROM usuarios 
WHERE funcao != 'ADMIN'
ORDER BY criado_em DESC;
