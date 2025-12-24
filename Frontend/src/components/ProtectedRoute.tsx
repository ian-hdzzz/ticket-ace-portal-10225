import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean; // Si true, requiere TODOS los permisos. Si false, requiere AL MENOS UNO
  requiredRole?: string;
  fallbackPath?: string;
  showError?: boolean;
}

/**
 * Componente para proteger rutas basado en permisos y roles
 * 
 * @example
 * // Requiere un permiso específico
 * <ProtectedRoute requiredPermission="crear_ticket">
 *   <CreateTicket />
 * </ProtectedRoute>
 * 
 * @example
 * // Requiere al menos uno de varios permisos
 * <ProtectedRoute requiredPermissions={["ver_tickets", "manage_tickets"]}>
 *   <Tickets />
 * </ProtectedRoute>
 * 
 * @example
 * // Requiere todos los permisos especificados
 * <ProtectedRoute requiredPermissions={["editar_ticket", "cerrar_ticket"]} requireAll={true}>
 *   <EditTicket />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  requiredRole,
  fallbackPath = '/dashboard',
  showError = true,
}: ProtectedRouteProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, loading } = usePermissions();

  // Mostrar loading mientras se cargan los permisos
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Verificar rol si se especifica
  if (requiredRole && !hasRole(requiredRole)) {
    if (showError) {
      return (
        <div className="container mx-auto p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acceso Denegado</AlertTitle>
            <AlertDescription>
              No tienes el rol necesario ({requiredRole}) para acceder a esta página.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  // Verificar permiso único
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (showError) {
      return (
        <div className="container mx-auto p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acceso Denegado</AlertTitle>
            <AlertDescription>
              No tienes el permiso necesario ({requiredPermission}) para acceder a esta página.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  // Verificar múltiples permisos
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      if (showError) {
        return (
          <div className="container mx-auto p-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Acceso Denegado</AlertTitle>
              <AlertDescription>
                No tienes los permisos necesarios para acceder a esta página.
                {requireAll
                  ? ` Se requieren todos los permisos: ${requiredPermissions.join(', ')}`
                  : ` Se requiere al menos uno de: ${requiredPermissions.join(', ')}`}
              </AlertDescription>
            </Alert>
          </div>
        );
      }
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Si pasa todas las validaciones, renderizar el contenido
  return <>{children}</>;
}
