
require('dotenv').config();

const prisma = require('@prisma/client').PrismaClient;
const db = new prisma();

async function main() {
  // Create or update the demo user.
  const user = await db.user.upsert({
    where: { id: 1 },
    update: { name: 'Demo User' },
    create: { id: 1, name: 'Demo User' },
  });

  // Restore the original sample posts safely.
  const posts = require('../src/data/postSeed');

  for (const post of posts) {
    await db.post.upsert({
      where: { id: post.id },
      update: {
        title: post.title,
        body: post.body,
        authorId: user.id,
      },
      create: {
        id: post.id,
        title: post.title,
        body: post.body,
        authorId: user.id,
      },
    });
  }

  // Keep PostgreSQL auto-increment sequences in sync.
  await db.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence('"User"', 'id'),
      GREATEST(COALESCE((SELECT MAX(id) FROM "User"), 1), 1),
      true
    )
  `;

  await db.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence('"Post"', 'id'),
      GREATEST(COALESCE((SELECT MAX(id) FROM "Post"), 1), 1),
      true
    )
  `;

  console.log('Seed data created successfully.');
}

main()
  .catch((error) => {
    console.error('Seeding failed.');
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
