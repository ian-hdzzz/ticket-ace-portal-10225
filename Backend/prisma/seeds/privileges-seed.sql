import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  -- console.log("💾 Pushing database schema...");
  -- await import("child_process").then(({ execSync }) =>
  --   execSync("npx prisma db push", { stdio: "inherit" })
  -- );

  console.log("🌱 Starting privilegesseed...");

  // --- Create Privileges ---
  const readPrivilege = await prisma.privilege.upsert({
    where: { id: 1 },
    update: {},
    create: { description: "access_dashboard" },
  });

  const writePrivilege = await prisma.privilege.upsert({
    where: { id: 2 },
    update: {},
    create: { description: "generete_reports" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 3 },
    update: {},
    create: { description: "download_reports" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 4 },
    update: {},
    create: { description: "share_reports" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 5 },
    update: {},
    create: { description: "see_tickets" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 6 },
    update: {},
    create: { description: "create_tickets" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 7 },
    update: {},
    create: { description: "take_tickets" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 8 },
    update: {},
    create: { description: "edit_tickets" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 9 },
    update: {},
    create: { description: "close_tickets" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 10 },
    update: {},
    create: { description: "reopen_tickets" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 11 },
    update: {},
    create: { description: "assign_tickets" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 12 },
    update: {},
    create: { description: "reassign_tickets" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 13 },
    update: {},
    create: { description: "prioritize_tickets" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 14 },
    update: {},
    create: { description: "see_conversation_histories" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 15 },
    update: {},
    create: { description: "attach_files" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 16 },
    update: {},
    create: { description: "create_orders" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 17 },
    update: {},
    create: { description: "create_agents" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 18 },
    update: {},
    create: { description: "edit_agents" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 19 },
    update: {},
    create: { description: "delete_agents" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 20 },
    update: {},
    create: { description: "approve_users" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 21 },
    update: {},
    create: { description: "edit_users" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 22 },
    update: {},
    create: { description: "delete_users" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 23 },
    update: {},
    create: { description: "assign_roles" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 24 },
    update: {},
    create: { description: "see_contract_numbers" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 25 },
    update: {},
    create: { description: "see_contract_readings" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 26 },
    update: {},
    create: { description: "see_contract_questions" },
  });

  console.log("✓ Privileges created");

  console.log("🎉 Privileges Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
