import React, { useState, useEffect } from "react";
import { FiCopy } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from '../../supabase/client.ts';
import { createUser, assignUserRole, updateUser, updateUserRole, deleteUser } from "@/api/AdminUsersSupa";

const getRoles = async () => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('id, name');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
};
const getRoleDisplayName = (role) => role?.name || "";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "" });
  const [tempPassword, setTempPassword] = useState("");
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingUsersRolesId, setEditingUsersRolesId] = useState(null);

  const [roles, setRoles] = useState([]);

  // Helper to get object from array or object
  const getObj = (val) => Array.isArray(val) ? val[0] : val;

  // Función global para refrescar usuarios
  const fetchUsersWithRoles = async () => {
    const { data, error } = await supabase
      .from('users_roles')
      .select(`id, user:users!users_roles_user_id_fkey (id, full_name, email, phone), role:roles (id, name), assigned_by:users!users_roles_assigned_by_fkey (full_name)`);
    if (error) {
      console.error('Error fetching users with roles:', error);
      setUsers([]);
      return;
    }
    // Debug: print each row from Supabase
    if (data && Array.isArray(data)) {
      data.forEach((row, idx) => {
        console.log(`Row ${idx}:`, row);
      });
    }
    const mapped = data
      .filter(row => getObj(row.user) && getObj(row.user).id)
      .map((row) => {
        const user = getObj(row.user);
        const role = getObj(row.role);
        const assigned_by = getObj(row.assigned_by);
        return {
          id: user.id,
          users_roles_id: row.id,
          name: user.full_name,
          email: user.email,
          phone: user.phone || "",
          role: role?.name || "",
          assigned_by: assigned_by?.full_name || "",
        };
      });
    setUsers(mapped);
  };

  useEffect(() => {
    const fetchRoles = async () => {
      const rolesFromDb = await getRoles();
      setRoles(rolesFromDb);
      setForm((prev) => ({ ...prev, role: rolesFromDb[0]?.id || "" }));
    };
    fetchRoles();
    fetchUsersWithRoles();
  }, []);

  // Filter users by role
  const filteredUsers = filterRole
    ? users.filter((u) => u.role === filterRole)
    : users;

  // Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle role select
  const handleRoleChange = (e) => {
    setForm({ ...form, role: e.target.value });
  };

  // Generar contraseña aleatoria de 16 caracteres
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  // Paso previo: mostrar contraseña y disclaimer
  const handleShowPasswordStep = () => {
    const password = generatePassword();
    setTempPassword(password);
    setShowPasswordStep(true);
  };

  // Validación sencilla antes de crear usuario
  const validateForm = () => {
    if (!form.name.trim()) return "El nombre es obligatorio.";
    if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/)) return "El correo no es válido.";
    if (!tempPassword || tempPassword.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    if (!form.role) return "Debes asignar un rol.";
    return null;
  };

  // Crear usuario en tabla users y asignar rol (sin Auth)
  const handleCreate = async () => {
    const errorMsg = validateForm();
    if (errorMsg) {
      window.alert(errorMsg);
      return;
    }
    try {
      const user = await createUser({
        full_name: form.name,
        email: form.email,
        phone: form.phone,
        password: tempPassword
      });
      await assignUserRole({
        user_id: user.id,
        role_id: form.role,
        assigned_by: null
      });
      window.alert("Usuario creado correctamente.");
      setForm({ name: "", email: "", phone: "", role: roles[0]?.id || "" });
      setTempPassword("");
      setShowPasswordStep(false);
      await fetchUsersWithRoles();
    } catch (err) {
      window.alert("Error creando usuario: " + (err.message || err));
    }
  };

  // Handle user edit
  const handleEdit = (user) => {
    // Buscar el id del rol por el nombre
    const roleObj = roles.find(r => r.name === user.role);
    console.log('handleEdit - user:', user);
    console.log('handleEdit - user.id:', user.id);
    console.log('handleEdit - users_roles_id:', user.users_roles_id);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: roleObj?.id || ""
    });
    setEditingId(user.id);
    setEditingUsersRolesId(user.users_roles_id);
  };

  // Handle user update (Supabase)
  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      console.log('handleUpdate - editingId:', editingId);
      console.log('handleUpdate - editingUsersRolesId:', editingUsersRolesId);
      console.log('handleUpdate - form:', form);
      const userUpdateRes = await updateUser(editingId, {
        full_name: form.name,
        email: form.email,
        phone: form.phone
      });
      console.log('handleUpdate - updateUser response:', userUpdateRes);
      const roleUpdateRes = await updateUserRole(editingUsersRolesId, form.role);
      console.log('handleUpdate - updateUserRole response:', roleUpdateRes);
      window.alert("Usuario actualizado correctamente.");
      setEditingId(null);
      setEditingUsersRolesId(null);
      setForm({ name: "", email: "", phone: "", role: roles[0]?.id || "" });
      await fetchUsersWithRoles();
    } catch (err) {
      window.alert("Error actualizando usuario: " + (err.message || err));
    }
  };

  // Handle user delete (Supabase)
  const handleDelete = async (id) => {
    try {
      console.log('handleDelete - id:', id);
      await deleteUser(id);
      window.alert("Usuario eliminado correctamente.");
      await fetchUsersWithRoles();
    } catch (err) {
      window.alert("Error eliminando usuario: " + (err.message || err));
    }
  };

  return (
    <div className="p-6 w-[90%] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Administración de Usuarios</h1>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Registrar nuevo usuario</h2>
        <form className="flex flex-col gap-4 bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col gap-4">
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nombre completo"
              className="w-full"
            />
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Correo electrónico"
                type="email"
                className="w-full md:w-1/2"
              />
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Teléfono"
                type="tel"
                className="w-full md:w-1/2"
              />
            </div>
      <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Asignar rol" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Mostrar contraseña temporal y disclaimer antes de crear usuario */}
      {!editingId && showPasswordStep && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg select-all">{tempPassword}</span>
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => {
                navigator.clipboard.writeText(tempPassword);
              }}
              title="Copiar contraseña"
            >
              <FiCopy size={20} />
            </button>
          </div>
          <div className="text-xs text-gray-700">
            <b>Importante:</b> Copia la contraseña temporal y compártela con el usuario. <br />
            Esta contraseña solo se mostrará una vez. El usuario deberá cambiarla al iniciar sesión.
          </div>
          <Button type="button" className="mt-2" onClick={handleCreate}>
            Entiendo y quiero crear el usuario
          </Button>
        </div>
      )}
          </div>
          <div className="flex gap-4 items-center">
            <div className="w-full">
              {editingId ? (
                <Button onClick={handleUpdate} type="button" className="w-full">Actualizar</Button>
              ) : (
                !showPasswordStep && (
                  <Button onClick={handleShowPasswordStep} type="button" className="w-full">Crear usuario</Button>
                )
              )}
            </div>
          </div>
        </form>
      </div>
      <div className="mb-4 flex gap-2 items-center">
        <span>Filtrar por rol:</span>
      <Select value={filterRole || "all"} onValueChange={(value) => setFilterRole(value === "all" ? "" : value)}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Todos los roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.name}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Nombre</th>
              <th className="p-4 text-left">Rol</th>
              <th className="p-4 text-left">Asignado por</th>
              <th className="p-4 text-left">Correo</th>
              <th className="p-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers
              .filter(user => user.name || user.email || user.role || user.assigned_by)
              .map((user, idx) => (
                <tr key={user.id || idx} className="border-t">
                  <td className="p-2">{user.name || "Sin nombre"}</td>
                  <td className="p-2">{user.role || "Sin rol"}</td>
                  <td className="p-2">{user.assigned_by || "Sin asignador"}</td>
                  <td className="p-2">{user.email || "Sin correo"}</td>
                  <td className="p-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {/* Paginación mock */}
        <div className="p-2 text-right text-xs bg-gray-50">Página 1 de 1</div>
      </div>
    </div>
  );
}
