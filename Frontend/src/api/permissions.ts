import { supabase } from '../supabase/client';

/**
 * API para gestionar permisos de usuarios
 */

/**
 * Obtener todos los permisos de un usuario
 */
export async function getUserPermissions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_permissions_view')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    throw error;
  }
}

/**
 * Obtener roles de un usuario
 */
export async function getUserRoles(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users_roles')
      .select(`
        id,
        role:roles (
          id,
          name,
          description,
          hierarchical_level
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user roles:', error);
    throw error;
  }
}

/**
 * Asignar un rol a un usuario
 */
export async function assignRoleToUser(userId: string, roleId: string, assignedBy?: string) {
  try {
    const { data, error } = await supabase
      .from('users_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
        assigned_by: assignedBy || null,
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error assigning role to user:', error);
    throw error;
  }
}

/**
 * Remover un rol de un usuario
 */
export async function removeRoleFromUser(userId: string, roleId: string) {
  try {
    const { error } = await supabase
      .from('users_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing role from user:', error);
    throw error;
  }
}

/**
 * Obtener todos los roles disponibles
 */
export async function getAllRoles() {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('active', true)
      .order('hierarchical_level', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
}

/**
 * Obtener todos los privilegios disponibles
 */
export async function getAllPrivileges() {
  try {
    const { data, error } = await supabase
      .from('privileges')
      .select('*')
      .order('module', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching privileges:', error);
    throw error;
  }
}

/**
 * Obtener privilegios de un rol específico
 */
export async function getRolePrivileges(roleId: string) {
  try {
    const { data, error } = await supabase
      .from('roles_privileges')
      .select(`
        privilege:privileges (
          id,
          name,
          description,
          module
        )
      `)
      .eq('role_id', roleId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching role privileges:', error);
    throw error;
  }
}

/**
 * Verificar si un usuario tiene un privilegio específico (usando función SQL)
 */
export async function checkUserPrivilege(userId: string, privilegeName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('user_has_privilege', {
      p_user_id: userId,
      p_privilege_name: privilegeName,
    });

    if (error) throw error;
    return data === true;
  } catch (error) {
    console.error('Error checking user privilege:', error);
    return false;
  }
}

/**
 * Asignar un privilegio a un rol
 */
export async function assignPrivilegeToRole(roleId: string, privilegeId: string) {
  try {
    const { data, error } = await supabase
      .from('roles_privileges')
      .insert({
        role_id: roleId,
        privilege_id: privilegeId,
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error assigning privilege to role:', error);
    throw error;
  }
}

/**
 * Remover un privilegio de un rol
 */
export async function removePrivilegeFromRole(roleId: string, privilegeId: string) {
  try {
    const { error } = await supabase
      .from('roles_privileges')
      .delete()
      .eq('role_id', roleId)
      .eq('privilege_id', privilegeId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing privilege from role:', error);
    throw error;
  }
}
