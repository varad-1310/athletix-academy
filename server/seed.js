require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('Seeding database...');
    // Seed data logic
    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

seedDatabase();
