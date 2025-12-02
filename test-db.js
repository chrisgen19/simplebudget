const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('Testing database connection...\n');

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL is not defined in .env file');
    process.exit(1);
  }

  console.log('✓ DATABASE_URL found in .env');

  try {
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    console.log('✓ Prisma client created');

    // Test the connection with a simple query
    await prisma.$connect();
    console.log('✓ Successfully connected to database');

    // Try to query the database
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    console.log('\n📊 Database Info:');
    console.log(result[0]);

    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log('\n📋 Tables in database:');
    if (tables.length === 0) {
      console.log('  No tables found. You may need to run: npx prisma db push');
    } else {
      tables.forEach(table => console.log(`  - ${table.table_name}`));
    }

    await prisma.$disconnect();
    console.log('\n✅ Database connection test successful!');

  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
