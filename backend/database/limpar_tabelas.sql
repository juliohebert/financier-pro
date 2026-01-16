-- Remover tabelas antigas em inglês (se existirem)
-- ATENÇÃO: Execute apenas se você ainda não tem dados importantes!

DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Agora execute o arquivo schema_pt.sql
-- Ou copie todo o conteúdo deste arquivo + schema_pt.sql e execute tudo junto
