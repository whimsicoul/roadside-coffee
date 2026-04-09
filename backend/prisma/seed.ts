import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import bcrypt from 'bcryptjs';

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

  console.log(`Seeded ${menuItems.count} menu items`);

  // Seed admin user
  // Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running in production
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@roadsidecoffee.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const password_hash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        first_name: 'Admin',
        last_name: 'User',
        email: adminEmail,
        password_hash,
        role: 'admin',
      },
    });
    console.log(`Created admin user: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  // Seed test customer user
  const testEmail = 'test@roadsidecoffee.com';
  const existingTest = await prisma.user.findUnique({ where: { email: testEmail } });

  if (!existingTest) {
    const password_hash = await bcrypt.hash('TestUser123!', 12);
    await prisma.user.create({
      data: {
        first_name: 'Test',
        last_name: 'User',
        email: testEmail,
        password_hash,
        phone: '555-0100',
        license_plate: 'TEST-01',
        role: 'customer',
      },
    });
    console.log(`Created test customer: ${testEmail}`);
  } else {
    console.log(`Test customer already exists: ${testEmail}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
