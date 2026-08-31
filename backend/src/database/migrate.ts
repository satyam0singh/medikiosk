import { runMigrations, checkDatabaseHealth, dbPool } from './postgres';

async function main() {
  console.log('🚀 Connecting to PostgreSQL database (Local or Supabase)...');
  const health = await checkDatabaseHealth();
  
  if (health.status !== 'UP') {
    console.error(`❌ Could not connect to database: ${health.message}`);
    process.exit(1);
  }

  console.log(`✅ Connected to database: ${health.details?.database || 'PostgreSQL'}`);
  console.log('🔄 Applying migrations and database schema...');
  
  await runMigrations();
  
  console.log('🎉 Database migrations completed successfully!');
  await dbPool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
