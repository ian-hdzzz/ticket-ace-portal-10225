import { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionGateProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  role?: string;
  fallback?: ReactNode;
}

/**
 * Componente para mostrar/ocultar elementos de UI basado en permisos
 * Útil para ocultar botones, menús, etc.
 * 
 * @example
 * <PermissionGate permission="crear_ticket">
 *   <Button>Crear Ticket</Button>
 * </PermissionGate>
 * 
 * @example
 * <PermissionGate permissions={["editar_ticket", "eliminar_ticket"]}>
 *   <TicketActions />
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, loading } = usePermissions();

  // No mostrar nada mientras carga
  if (loading) {
    return <>{fallback}</>;
  }

  // Verificar rol
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // Verificar permiso único
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Verificar múltiples permisos
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
