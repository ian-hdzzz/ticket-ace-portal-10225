import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de privilegios...");

  const privilegios = [
    { descripcion: "acceso_dashboard", nombre: "Acceso a dashboard" },
    { descripcion: "generar_reportes", nombre: "Generar reportes/gráficos" },
    { descripcion: "descargar_reportes", nombre: "Descargar reportes" },
    { descripcion: "compartir_reportes", nombre: "Compartir reportes" },
    { descripcion: "ver_tickets", nombre: "Ver Tickets" },
    { descripcion: "crear_ticket", nombre: "Crear Ticket" },
    { descripcion: "tomar_ticket", nombre: "Tomar ticket" },
    { descripcion: "editar_ticket", nombre: "Editar Ticket" },
    { descripcion: "cerrar_ticket", nombre: "Cerrar Ticket" },
    { descripcion: "reabrir_ticket", nombre: "Reabrir Ticket" },
    { descripcion: "asignar_ticket", nombre: "Asignar Ticket" },
    { descripcion: "reasignar_ticket", nombre: "Reasignar Ticket" },
    { descripcion: "priorizar_ticket", nombre: "Priorizar Ticket" },
    { descripcion: "ver_historial_conversacion", nombre: "Ver historial de conversación" },
    { descripcion: "adjuntar_archivos", nombre: "Adjuntar Archivos" },
    { descripcion: "crear_orden", nombre: "Crear Orden" },
    { descripcion: "crear_agente", nombre: "Crear Agente" },
    { descripcion: "editar_agente", nombre: "Editar Agente" },
    { descripcion: "eliminar_agente", nombre: "Eliminar Agente" },
    { descripcion: "aprobar_usuario", nombre: "Aprobar Usuario" },
    { descripcion: "editar_info_usuario", nombre: "Editar info usuario" },
    { descripcion: "eliminar_usuario", nombre: "Eliminar Usuario" },
    { descripcion: "asignar_roles", nombre: "Asignar Roles" },
    { descripcion: "ver_numero_contratos", nombre: "Ver número de contratos" },
    { descripcion: "ver_lecturas", nombre: "Ver lecturas" },
    { descripcion: "ver_deuda", nombre: "Ver deuda" },
  ];

  for (const privilegio of privilegios) {
    await prisma.privilegio.upsert({
      where: { descripcion: privilegio.descripcion },
      update: {},
      create: { descripcion: privilegio.descripcion },
    });
    console.log(`✓ Privilegio creado: ${privilegio.nombre}`);
  }

  console.log("🎉 Seed de privilegios completado exitosamente!");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

