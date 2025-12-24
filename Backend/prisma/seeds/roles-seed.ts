import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de roles...");

  const roles = [
    { nombre: 'Administrador', descripcion: 'Acceso total al sistema', nivel_jerarquico: 1 },
    { nombre: 'Gerencia', descripcion: 'Gerencia general', nivel_jerarquico: 2 },
    { nombre: 'Subgerencia de Contratos', descripcion: 'Gestión de contratos', nivel_jerarquico: 3 },
    { nombre: 'Subgerencia de Factibilidades', descripcion: 'Gestión de factibilidades', nivel_jerarquico: 3 },
    { nombre: 'Subgerencia de Inspección y Vigilancia', descripcion: 'Inspección y vigilancia', nivel_jerarquico: 3 },
    { nombre: 'Subgerencia de Lecturas', descripcion: 'Gestión de lecturas', nivel_jerarquico: 3 },
    { nombre: 'Subgerencia de Limitación y Reconexión de Servicio', descripcion: 'Control de limitación y reconexión', nivel_jerarquico: 3 },
    { nombre: 'Subgerencia de Servicio al Cliente', descripcion: 'Atención al cliente', nivel_jerarquico: 3 },
    { nombre: 'Subgerencia de Soporte Técnico', descripcion: 'Soporte técnico del sistema', nivel_jerarquico: 3 },
    { nombre: 'Gerencia de Control y Seguimiento de Factibilidades', descripcion: 'Control de factibilidades', nivel_jerarquico: 2 },
    { nombre: 'Gerencia de Facturación', descripcion: 'Gestión de facturación', nivel_jerarquico: 2 },
    { nombre: 'Gerencia de Infraestructura Informática y Seg. de la Info.', descripcion: 'Infraestructura y seguridad', nivel_jerarquico: 2 },
    { nombre: 'Gerencia de Ingeniería de Operación', descripcion: 'Ingeniería operativa', nivel_jerarquico: 2 },
    { nombre: 'Gerencia de Medición de Consumos', descripcion: 'Medición y control de consumos', nivel_jerarquico: 2 },
    { nombre: 'Gerencia de Operación y Mantenimiento PTAR', descripcion: 'Operación de plantas de tratamiento', nivel_jerarquico: 2 },
    { nombre: 'Gerencia de Programas de Inversión', descripcion: 'Gestión de inversiones', nivel_jerarquico: 2 },
    { nombre: 'Gerencia de Regularización de Asentamientos e Inspección', descripcion: 'Regularización de asentamientos', nivel_jerarquico: 2 },
    { nombre: 'Gerencia de Tesorería', descripcion: 'Gestión de tesorería', nivel_jerarquico: 2 },
    { nombre: 'Gerencia Jurídica de Recuperación de Cartera', descripcion: 'Recuperación legal de cartera', nivel_jerarquico: 2 },
    { nombre: 'Call Center Externo', descripcion: 'Operadores externos de call center', nivel_jerarquico: 4 },
    { nombre: 'Coordinación de Planeación y Proyectos Técnicos', descripcion: 'Planeación técnica', nivel_jerarquico: 3 },
    { nombre: 'Coordinación de Vinculación Comercial y Servicio al Cliente', descripcion: 'Vinculación comercial', nivel_jerarquico: 3 },
    { nombre: 'Coordinación General Ejecutiva', descripcion: 'Coordinación ejecutiva general', nivel_jerarquico: 1 },
    { nombre: 'Gerencia Comercial', descripcion: 'Gestión comercial', nivel_jerarquico: 2 },
    { nombre: 'Gerencia de Administración de Proyectos', descripcion: 'Administración de proyectos', nivel_jerarquico: 2 },
    { nombre: 'Gerencia de Cartera Vencida Administrativa', descripcion: 'Gestión de cartera vencida', nivel_jerarquico: 2 },
    { nombre: 'Gerencia de Contratación y Padrón de Usuarios', descripcion: 'Contratación y padrón', nivel_jerarquico: 2 },
    { nombre: 'Gerencia de Control Sanitario y Pluvial', descripcion: 'Control sanitario', nivel_jerarquico: 2 },
  ];

  for (const rol of roles) {
    await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: {},
      create: {
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        nivel_jerarquico: rol.nivel_jerarquico,
        activo: true,
      },
    });
    console.log(`✓ Rol creado: ${rol.nombre}`);
  }

  console.log("🎉 Seed de roles completado exitosamente!");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed de roles:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

