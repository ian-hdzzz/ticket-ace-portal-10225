import { supabase } from '../supabase/client';
const USERS_TABLE = 'users';
const USERS_ROLES_TABLE = 'users_roles';

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
