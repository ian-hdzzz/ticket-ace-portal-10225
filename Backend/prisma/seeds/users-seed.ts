import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de usuarios...");

  // Hash password for dummy users
  const hashedAdminPass = await bcrypt.hash('admin123', 10);
  const hashedUserPass = await bcrypt.hash('user123', 10);

  const usuarios = [
    {
      correo: 'andrezala03@gmail.com',
      contrasena: hashedAdminPass,
      nombre_completo: 'Andre Zaldivar Agle',
      telefono: '4421234567',
      activo: true,
      contrasena_es_temporal: true,
    },
    {
      correo: 'admin@cea.gob.mx',
      contrasena: hashedAdminPass,
      nombre_completo: 'Administrador CEA',
      telefono: '4421111111',
      activo: true,
      contrasena_es_temporal: false,
    },
    {
      correo: 'gerente@cea.gob.mx',
      contrasena: hashedUserPass,
      nombre_completo: 'Gerente General',
      telefono: '4422222222',
      activo: true,
      contrasena_es_temporal: false,
    },
    {
      correo: 'operador@cea.gob.mx',
      contrasena: hashedUserPass,
      nombre_completo: 'Operador de Sistema',
      telefono: '4423333333',
      activo: true,
      contrasena_es_temporal: false,
    },
    {
      correo: 'callcenter@cea.gob.mx',
      contrasena: hashedUserPass,
      nombre_completo: 'Agente Call Center',
      telefono: '4424444444',
      activo: true,
      contrasena_es_temporal: false,
    },
  ];

  for (const usuario of usuarios) {
    await prisma.usuario.upsert({
      where: { correo: usuario.correo },
      update: {},
      create: usuario,
    });
    console.log(`✓ Usuario creado: ${usuario.nombre_completo} (${usuario.correo})`);
  }

  console.log("🎉 Seed de usuarios completado exitosamente!");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed de usuarios:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

