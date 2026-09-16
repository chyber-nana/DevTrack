import "dotenv/config";
import { db } from "../prisma/db.js";

const projects = [
  {
    name: "Inventory System",
    description:
      "Full-stack inventory and sales management application with products, stock, sales, profit tracking, credits, and analytics.",
    progress: 0,
  },
  {
    name: "Alumni Ticketing Platform",
    description:
      "Event ticketing platform with online payments, digital tickets, QR verification, attendee management, and admin analytics.",
    progress: 0,
  },
  {
    name: "Will / Document Platform",
    description:
      "Document-generation platform with multi-step forms, conditional logic, PDF generation, payments, and API integrations.",
    progress: 0,
  },
  {
    name: "Mobile + AI App",
    description:
      "React Native and Expo mobile application combining business tracking, notifications, offline functionality, and AI features.",
    progress: 0,
  },
];

async function seed() {
  console.log("🌱 Seeding portfolio projects...");

  let created = 0;
  let skipped = 0;

  for (const project of projects) {
    const existing = await db.orm.public.Project
      .where({ name: project.name })
      .first();

    if (existing) {
      console.log(`⏭️ Skipped ${project.name} — already exists`);
      skipped++;
    } else {
      await db.orm.public.Project.create(project);
      console.log(`✅ Created ${project.name}`);
      created++;
    }
  }

  console.log(`✅ Created ${created} projects.`);
  console.log(`⏭️ Skipped ${skipped} existing projects.`);
}

seed()
  .catch((error) => {
    console.error("❌ Project seed failed:");
    console.error(error);
    process.exit(1);
  });