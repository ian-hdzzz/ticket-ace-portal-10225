import { usePermissions } from '@/hooks/usePermissions';

export default function TestPermissions() {
  const { permissions, roles, loading, hasPermission } = usePermissions();

  if (loading) return <div className="p-8">Cargando permisos...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔐 Test de Permisos</h1>
      
      <div className="bg-blue-50 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">👤 Tus Roles:</h2>
        {roles.length === 0 ? (
          <p className="text-red-600">⚠️ No tienes roles asignados</p>
        ) : (
          <ul className="list-disc list-inside">
            {roles.map(role => (
              <li key={role.role_id} className="text-lg">{role.role_name}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-green-50 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">
          ✅ Tus Permisos ({permissions.length}):
        </h2>
        {permissions.length === 0 ? (
          <p className="text-red-600">⚠️ No tienes permisos asignados</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {permissions.map(perm => (
              <div key={perm.privilege_id} className="text-sm bg-white p-2 rounded">
                <span className="font-semibold">{perm.privilege_name}</span>
                <span className="text-gray-500 ml-2">({perm.privilege_module})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-yellow-50 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">🧪 Verificaciones:</h2>
        <div className="space-y-2">
          <p className="text-lg">
            <span className="font-semibold">¿Puede crear tickets?</span>
            {hasPermission('crear_ticket') ? 
              <span className="text-green-600 ml-2">✅ SÍ</span> : 
              <span className="text-red-600 ml-2">❌ NO</span>
            }
          </p>
          <p className="text-lg">
            <span className="font-semibold">¿Puede ver dashboard?</span>
            {hasPermission('acceso_dashboard') ? 
              <span className="text-green-600 ml-2">✅ SÍ</span> : 
              <span className="text-red-600 ml-2">❌ NO</span>
            }
          </p>
          <p className="text-lg">
            <span className="font-semibold">¿Es admin?</span>
            {hasPermission('access_admin_panel') ? 
              <span className="text-green-600 ml-2">✅ SÍ</span> : 
              <span className="text-red-600 ml-2">❌ NO</span>
            }
          </p>
          <p className="text-lg">
            <span className="font-semibold">¿Puede editar tickets?</span>
            {hasPermission('editar_ticket') ? 
              <span className="text-green-600 ml-2">✅ SÍ</span> : 
              <span className="text-red-600 ml-2">❌ NO</span>
            }
          </p>
          <p className="text-lg">
            <span className="font-semibold">¿Puede ver contratos?</span>
            {hasPermission('ver_numero_contratos') ? 
              <span className="text-green-600 ml-2">✅ SÍ</span> : 
              <span className="text-red-600 ml-2">❌ NO</span>
            }
          </p>
        </div>
      </div>
    </div>
  );
}