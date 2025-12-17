import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

export interface UserPermission {
  privilege_id: string;
  privilege_name: string;
  privilege_module: string;
}

export interface UserRole {
  role_id: string;
  role_name: string;
}

/**
 * Hook para obtener los permisos del usuario actual
 */
export function usePermissions() {
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener el usuario actual
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setPermissions([]);
        setRoles([]);
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      const userId = user.id;

      // Consultar permisos del usuario desde la vista
      const { data, error: permError } = await supabase
        .from('user_permissions_view')
        .select('role_id, role_name, privilege_id, privilege_name, privilege_module')
        .eq('user_id', userId);

      if (permError) {
        console.error('Error loading permissions:', permError);
        setError(permError.message);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        // Extraer roles únicos
        const uniqueRoles = Array.from(
          new Map(data.map(item => [item.role_id, { role_id: item.role_id, role_name: item.role_name }])).values()
        );
        setRoles(uniqueRoles as UserRole[]);

        // Extraer permisos únicos
        const uniquePermissions = Array.from(
          new Map(
            data.map(item => [
              item.privilege_id,
              {
                privilege_id: item.privilege_id,
                privilege_name: item.privilege_name,
                privilege_module: item.privilege_module,
              },
            ])
          ).values()
        );
        setPermissions(uniquePermissions as UserPermission[]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error in loadPermissions:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLoading(false);
    }
  };

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  const hasPermission = (permissionName: string): boolean => {
    return permissions.some(p => p.privilege_name === permissionName);
  };

  /**
   * Verificar si el usuario tiene al menos uno de los permisos especificados
   */
  const hasAnyPermission = (permissionNames: string[]): boolean => {
    return permissionNames.some(name => hasPermission(name));
  };

  /**
   * Verificar si el usuario tiene todos los permisos especificados
   */
  const hasAllPermissions = (permissionNames: string[]): boolean => {
    return permissionNames.every(name => hasPermission(name));
  };

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = (roleName: string): boolean => {
    return roles.some(r => r.role_name === roleName);
  };

  /**
   * Recargar permisos (útil después de cambios de rol)
   */
  const refetch = () => {
    loadPermissions();
  };

  return {
    permissions,
    roles,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    refetch,
  };
}
