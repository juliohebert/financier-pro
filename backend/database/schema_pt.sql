-- Schema do Banco de Dados em Português - FinanGestão Pro
-- PostgreSQL / Neon Database

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  funcao VARCHAR(50) DEFAULT 'USUARIO', -- 'USUARIO' ou 'ADMIN'
  status_licenca VARCHAR(50) DEFAULT 'TESTE', -- 'TESTE', 'ATIVO', 'EXPIRADO', 'INATIVO'
  plano_licenca VARCHAR(100) DEFAULT 'Teste',
  data_inicio_teste TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  documento VARCHAR(50) NOT NULL, -- CPF ou CNPJ
  iniciais VARCHAR(10),
  email VARCHAR(255),
  telefone VARCHAR(50),
  endereco TEXT,
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Empréstimos
CREATE TABLE IF NOT EXISTS emprestimos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nome_cliente VARCHAR(255) NOT NULL,
  valor_principal DECIMAL(15, 2) NOT NULL,
  taxa_juros DECIMAL(5, 2) NOT NULL, -- Taxa de juros mensal
  total_receber DECIMAL(15, 2) NOT NULL, -- Valor total com juros
  valor_pago DECIMAL(15, 2) DEFAULT 0,
  data_inicio DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'ATIVO', -- 'ATIVO', 'QUITADO', 'ATRASADO'
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id SERIAL PRIMARY KEY,
  emprestimo_id INTEGER NOT NULL REFERENCES emprestimos(id) ON DELETE CASCADE,
  data_pagamento DATE NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  tipo_pagamento VARCHAR(50) NOT NULL, -- 'JUROS' ou 'AMORTIZACAO'
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Transações (Fluxo de Caixa)
CREATE TABLE IF NOT EXISTS transacoes (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  data_transacao DATE NOT NULL,
  descricao TEXT NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  tipo_transacao VARCHAR(50) NOT NULL, -- 'ENTRADA' ou 'SAIDA'
  valor DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'LIQUIDADO', -- 'LIQUIDADO', 'PENDENTE'
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Configurações do Usuário
CREATE TABLE IF NOT EXISTS configuracoes_usuario (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  taxa_juros_padrao DECIMAL(5, 2) DEFAULT 5.00,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_clientes_usuario_id ON clientes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_emprestimos_usuario_id ON emprestimos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_emprestimos_cliente_id ON emprestimos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_emprestimos_status ON emprestimos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_emprestimo_id ON pagamentos(emprestimo_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_usuario_id ON transacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data_transacao);

-- Função para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar atualizado_em
DROP TRIGGER IF EXISTS trigger_atualizar_usuarios ON usuarios;
CREATE TRIGGER trigger_atualizar_usuarios BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

DROP TRIGGER IF EXISTS trigger_atualizar_clientes ON clientes;
CREATE TRIGGER trigger_atualizar_clientes BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

DROP TRIGGER IF EXISTS trigger_atualizar_emprestimos ON emprestimos;
CREATE TRIGGER trigger_atualizar_emprestimos BEFORE UPDATE ON emprestimos
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

DROP TRIGGER IF EXISTS trigger_atualizar_configuracoes ON configuracoes_usuario;
CREATE TRIGGER trigger_atualizar_configuracoes BEFORE UPDATE ON configuracoes_usuario
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

-- Inserir usuário admin de teste
INSERT INTO usuarios (nome, email, senha_hash, funcao, status_licenca, plano_licenca)
VALUES ('Administrador', 'admin@financier.pro', '$2a$10$example_hash', 'ADMIN', 'ATIVO', 'Pro Anual')
ON CONFLICT (email) DO NOTHING;
