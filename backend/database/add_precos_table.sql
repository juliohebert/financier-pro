-- Tabela de Configuração de Preços
CREATE TABLE IF NOT EXISTS configuracoes_precos (
  id SERIAL PRIMARY KEY,
  plano_nome VARCHAR(50) UNIQUE NOT NULL, -- 'Mensal' ou 'Anual'
  preco DECIMAL(10, 2) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir preços padrão
INSERT INTO configuracoes_precos (plano_nome, preco)
VALUES 
  ('Mensal', 49.00),
  ('Anual', 468.00)
ON CONFLICT (plano_nome) DO NOTHING;

-- Trigger para atualizar atualizado_em
DROP TRIGGER IF EXISTS trigger_atualizar_precos ON configuracoes_precos;
CREATE TRIGGER trigger_atualizar_precos BEFORE UPDATE ON configuracoes_precos
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
