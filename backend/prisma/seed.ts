import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing menu items
  await prisma.menuItem.deleteMany();

  // Seed menu items
  const menuItems = await prisma.menuItem.createMany({
    data: [
      {
        name: 'Espresso',
        price: new Decimal('3.50'),
        description: 'Double shot espresso',
        image_url: 'https://via.placeholder.com/150?text=Espresso',
      },
      {
        name: 'Latte',
        price: new Decimal('5.00'),
        description: 'Espresso with steamed milk',
        image_url: 'https://via.placeholder.com/150?text=Latte',
      },
      {
        name: 'Cappuccino',
        price: new Decimal('5.00'),
        description: 'Espresso with steamed milk and foam',
        image_url: 'https://via.placeholder.com/150?text=Cappuccino',
      },
      {
        name: 'Cold Brew',
        price: new Decimal('4.50'),
        description: '12-hour cold brew concentrate',
        image_url: 'https://via.placeholder.com/150?text=Cold+Brew',
      },
      {
        name: 'Americano',
        price: new Decimal('3.75'),
        description: 'Espresso shots with hot water',
        image_url: 'https://via.placeholder.com/150?text=Americano',
      },
      {
        name: 'Macchiato',
        price: new Decimal('4.25'),
        description: 'Espresso with a small amount of milk',
        image_url: 'https://via.placeholder.com/150?text=Macchiato',
      },
      {
        name: 'Flat White',
        price: new Decimal('5.50'),
        description: 'Espresso with velvety steamed milk',
        image_url: 'https://via.placeholder.com/150?text=Flat+White',
      },
      {
        name: 'Mocha',
        price: new Decimal('5.75'),
        description: 'Espresso with steamed milk and chocolate',
        image_url: 'https://via.placeholder.com/150?text=Mocha',
      },
      {
        name: 'Cortado',
        price: new Decimal('4.00'),
        description: 'Equal parts espresso and steamed milk',
        image_url: 'https://via.placeholder.com/150?text=Cortado',
      },
      {
        name: 'Iced Latte',
        price: new Decimal('5.25'),
        description: 'Chilled espresso with cold milk',
        image_url: 'https://via.placeholder.com/150?text=Iced+Latte',
      },
    ],
  });

  console.log(
    `Seeded ${menuItems.count} menu items`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
