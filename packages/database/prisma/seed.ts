import { PrismaClient, RoleName } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding system roles...');

  const roles = Object.values(RoleName);
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `Default system role for ${roleName}`,
      },
    });
  }

  console.log('Seeding sample cuisine categories...');
  const cuisines = [
    { name: 'Italian', slug: 'italian', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5' },
    { name: 'Japanese', slug: 'japanese', imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c' },
    { name: 'Mexican', slug: 'mexican', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47' },
    { name: 'American', slug: 'american', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd' },
  ];

  for (const c of cuisines) {
    await prisma.cuisine.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });