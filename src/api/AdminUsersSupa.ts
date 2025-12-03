
import { supabase } from '../supabase/client';
const USERS_TABLE = 'users';
const USERS_ROLES_TABLE = 'users_roles';
// Crear usuario
export async function createUser(params: { full_name: string, email: string, phone: string, password: string }) {
  try {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .insert([{ full_name: params.full_name, email: params.email, phone: params.phone, password: params.password }])
      .select();
    if (error) throw error;
    if (Array.isArray(data) && data[0]?.id) {
      return data[0];
    }
    throw new Error('No se pudo crear el usuario.');
  } catch (err) {
    throw err;
  }
}

// Asignar rol a usuario
export async function assignUserRole({ user_id, role_id, assigned_by = null }) {
  try {
    const { data, error } = await supabase
      .from(USERS_ROLES_TABLE)
      .insert([{ user_id: user_id, role_id: role_id, assigned_by: assigned_by }])
      .select();
    if (error) throw error;
    return data;
  } catch (err) {
    throw err;
  }
}

// Editar usuario
export async function updateUser(id: string, params: { full_name: string, email: string, phone?: string }) {
  try {
    console.log('updateUser - id:', id);
    console.log('updateUser - params:', params);
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .update({
        full_name: params.full_name,
        email: params.email,
        phone: params.phone
      })
      .eq('id', id)
      .select();
    console.log('updateUser - response:', { data, error });
    if (error) throw error;
    return data;
  } catch (err) {
    throw err;
  }
}

export async function updateUserRole(user_id: string, role_id: string) {
  try {
    console.log('updateUserRole - user_id:', user_id);
    console.log('updateUserRole - role_id:', role_id);
    const { data, error } = await supabase
      .from(USERS_ROLES_TABLE)
      .update({ role_id })
      .eq('user_id', user_id)
      .select();
    console.log('updateUserRole - response:', { data, error });
    if (error) throw error;
    return data;
  } catch (err) {
    throw err;
  }
}
// Borrar user
export async function deleteUser(user_id: string) {
  try {
    // Primero borrar roles
    const { error: rolesError } = await supabase
      .from(USERS_ROLES_TABLE)
      .delete()
      .eq('user_id', user_id);
    if (rolesError) throw rolesError;
    // Luego borrar usuario
    const { error: userError } = await supabase
      .from(USERS_TABLE)
      .delete()
      .eq('id', user_id);
    if (userError) throw userError;
    return true;
  } catch (err) {
    throw err;
  }
}