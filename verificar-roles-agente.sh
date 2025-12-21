#!/bin/bash

echo "🔍 VERIFICANDO ROLES DE AGENTE EN LA BASE DE DATOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd Backend

echo "📊 Consultando roles en la base de datos..."
echo ""

# Crear script temporal de Node.js para consultar
cat > temp-check-roles.js << 'EOF'
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRoles() {
  try {
    console.log('🔍 Buscando roles en la base de datos...\n');
    
    // Obtener todos los roles
    const allRoles = await prisma.Role.findMany({
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                active: true
              }
            }
          }
        }
      }
    });
    
    console.log(`📋 Total de roles encontrados: ${allRoles.length}\n`);
    
    if (allRoles.length === 0) {
      console.log('❌ No se encontraron roles en la base de datos');
      console.log('   Necesitas crear roles primero\n');
      process.exit(1);
    }
    
    // Mostrar todos los roles
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('LISTA DE ROLES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    allRoles.forEach((role, index) => {
      const activeUsers = role.userRoles.filter(ur => ur.user.active).length;
      console.log(`${index + 1}. ${role.name}`);
      console.log(`   ID: ${role.id}`);
      console.log(`   Descripción: ${role.description || 'Sin descripción'}`);
      console.log(`   Usuarios activos: ${activeUsers}`);
      console.log(`   Activo: ${role.active ? '✅' : '❌'}`);
      
      if (activeUsers > 0) {
        console.log(`   Usuarios:`);
        role.userRoles
          .filter(ur => ur.user.active)
          .forEach(ur => {
            console.log(`      - ${ur.user.fullName} (${ur.user.email})`);
          });
      }
      console.log('');
    });
    
    // Buscar roles de agente
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ROLES DE AGENTE (para notificaciones):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const agentRoles = await prisma.Role.findMany({
      where: {
        OR: [
          { name: { contains: 'agente', mode: 'insensitive' } },
          { name: { contains: 'agent', mode: 'insensitive' } },
          { name: { contains: 'soporte', mode: 'insensitive' } },
          { name: { contains: 'support', mode: 'insensitive' } }
        ]
      },
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                active: true
              }
            }
          }
        }
      }
    });
    
    if (agentRoles.length === 0) {
      console.log('⚠️  NO SE ENCONTRARON ROLES DE AGENTE');
      console.log('');
      console.log('El webhook busca roles que contengan:');
      console.log('  - "agente" (ej: "Agente de Soporte")');
      console.log('  - "agent" (ej: "Support Agent")');
      console.log('  - "soporte" (ej: "Soporte Técnico")');
      console.log('  - "support" (ej: "Customer Support")');
      console.log('');
      console.log('📝 Solución:');
      console.log('   1. Crea un rol con alguno de estos nombres');
      console.log('   2. O modifica el código del webhook para buscar otros nombres');
      console.log('');
    } else {
      console.log(`✅ Se encontraron ${agentRoles.length} roles de agente:\n`);
      
      let totalActiveUsers = 0;
      
      agentRoles.forEach((role, index) => {
        const activeUsers = role.userRoles.filter(ur => ur.user.active);
        totalActiveUsers += activeUsers.length;
        
        console.log(`${index + 1}. ${role.name}`);
        console.log(`   ID: ${role.id}`);
        console.log(`   Usuarios activos: ${activeUsers.length}`);
        
        if (activeUsers.length > 0) {
          console.log(`   📧 Usuarios que recibirán notificaciones:`);
          activeUsers.forEach(ur => {
            console.log(`      - ${ur.user.fullName}`);
            console.log(`        Email: ${ur.user.email}`);
            console.log(`        ID: ${ur.user.id}`);
          });
        } else {
          console.log(`   ⚠️  No hay usuarios activos con este rol`);
        }
        console.log('');
      });
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📊 RESUMEN:`);
      console.log(`   - Roles de agente: ${agentRoles.length}`);
      console.log(`   - Usuarios activos totales: ${totalActiveUsers}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      if (totalActiveUsers === 0) {
        console.log('⚠️  ADVERTENCIA: Aunque hay roles de agente, no tienen usuarios activos');
        console.log('   Las notificaciones NO se crearán hasta que haya usuarios con estos roles\n');
      } else {
        console.log(`✅ Cuando se cree un ticket con tag "necesita_agente",`);
        console.log(`   se crearán ${totalActiveUsers} notificaciones\n`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('Posibles causas:');
    console.error('  1. La base de datos no está accesible');
    console.error('  2. Las variables de entorno DATABASE_URL no están configuradas');
    console.error('  3. La tabla "roles" no existe');
    console.error('');
  } finally {
    await prisma.$disconnect();
  }
}

checkRoles();
EOF

# Ejecutar el script
node temp-check-roles.js

# Limpiar
rm temp-check-roles.js

echo ""
echo "✅ Verificación completada"
echo ""
