// Cole este código no Console do navegador (F12) após fazer login
// para ver os dados exatos que estão sendo usados

const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('=== DADOS DO USUÁRIO ===');
console.log('Nome:', user.nome);
console.log('Email:', user.email);
console.log('Status:', user.statusLicenca);
console.log('Data Início Teste:', user.dataInicioTeste);
console.log('');

if (user.dataInicioTeste) {
  const start = new Date(user.dataInicioTeste);
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();
  const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, 14 - daysPassed);
  
  console.log('=== CÁLCULO DOS DIAS ===');
  console.log('Data início:', start.toLocaleString('pt-BR'));
  console.log('Data atual:', now.toLocaleString('pt-BR'));
  console.log('Dias passados:', daysPassed);
  console.log('Dias restantes:', daysRemaining);
} else {
  console.log('⚠️ dataInicioTeste está NULL ou indefinido!');
  console.log('Faça logout e login novamente.');
}
