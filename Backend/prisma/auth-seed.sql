import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();

async function main() {
  -- console.log("💾 Pushing database schema...");
  -- await import("child_process").then(({ execSync }) =>
  --   execSync("npx prisma db push", { stdio: "inherit" })
  -- );

  console.log("🌱 Starting seed...");

  // --- Create Privileges ---
  const readPrivilege = await prisma.privilege.upsert({
    where: { id: 1 },
    update: {},
    create: { description: "read_data" },
  });

  const writePrivilege = await prisma.privilege.upsert({
    where: { id: 2 },
    update: {},
    create: { description: "write_data" },
  });

  const deletePrivilege = await prisma.privilege.upsert({
    where: { id: 3 },
    update: {},
    create: { description: "delete_data" },
  });

  console.log("✓ Privileges created");

  // --- Create Roles ---
  const adminRole = await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: { name: "Admin" },
  });

  const managerRole = await prisma.role.upsert({
    where: { id: 2 },
    update: {},
    create: { name: "Manager" },
  });

  const userRole = await prisma.role.upsert({
    where: { id: 3 },
    update: {},
    create: { name: "User" },
  });

  console.log("✓ Roles created");

  // --- Assign Privileges to Roles ---
  await prisma.rolePrivilege.createMany({
    data: [
      { roleId: adminRole.id, privilegeId: readPrivilege.id },
      { roleId: adminRole.id, privilegeId: writePrivilege.id },
      { roleId: adminRole.id, privilegeId: deletePrivilege.id },

      { roleId: managerRole.id, privilegeId: readPrivilege.id },
      { roleId: managerRole.id, privilegeId: writePrivilege.id },

      { roleId: userRole.id, privilegeId: readPrivilege.id },
    ],
    skipDuplicates: true,
  });

  console.log("✓ Privileges assigned to roles");

  // --- Create Users ---
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      full_name: "Admin User",
      password: "admin123",
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: "manager@test.com" },
    update: {},
    create: {
      email: "manager@test.com",
      full_name: "Manager User",
      password: "manager123",
    },
  });

  const normalUser = await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      email: "user@test.com",
      full_name: "Normal User",
      password: "user123",
    },
  });

  const myUser = await.prisma.user.upsert({
    where: { email: andrezala03@gmail.com },
    update: {},
    create: {
      email: "fam@gmail.com",
      full_name: "Andre Zaldivar Agle",
      password: "famchi123"
    }
  })

  console.log("✓ Users created");

  // --- Assign Roles to Users ---
  await prisma.userRole.createMany({
    data: [
      { userId: adminUser.id, roleId: adminRole.id },
      { userId: managerUser.id, roleId: managerRole.id },
      { userId: normalUser.id, roleId: userRole.id },
    ],
    skipDuplicates: true,
  });

  console.log("✓ Roles assigned to users");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
