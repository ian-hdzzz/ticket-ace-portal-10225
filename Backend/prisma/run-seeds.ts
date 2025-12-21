import { execSync } from 'child_process';

/**
 * Main seed orchestrator
 * Runs all seed files in the correct order
 */
async function runSeeds() {
  console.log('🌱 Iniciando proceso de seeding...\n');

  const seeds = [
    { name: 'Privilegios', path: 'prisma/seeds/privileges-seed.ts' },
    { name: 'Roles', path: 'prisma/seeds/roles-seed.ts' },
    { name: 'Usuarios', path: 'prisma/seeds/users-seed.ts' },
  ];

  for (const seed of seeds) {
    try {
      console.log(`\n📦 Ejecutando seed: ${seed.name}`);
      console.log('─'.repeat(50));
      
      execSync(`npx tsx ${seed.path}`, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      console.log(`✅ ${seed.name} - Completado\n`);
    } catch (error) {
      console.error(`❌ Error ejecutando seed de ${seed.name}:`, error);
      process.exit(1);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Todos los seeds completados exitosamente!');
  console.log('='.repeat(50) + '\n');
}

runSeeds()
  .catch((error) => {
    console.error('❌ Error fatal en proceso de seeding:', error);
    process.exit(1);
  });

