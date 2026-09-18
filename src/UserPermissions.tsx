import { useMemo, useState } from 'react'
import { CheckCircle2, KeyRound, Plus, Save, Search, ShieldCheck, UserCog, Users, X } from 'lucide-react'
import { allPermissionSections, permissionGroups } from './access-control'
import { InstitutionSettings } from './institution'

type Props = { settings: InstitutionSettings; onSave: (settings: InstitutionSettings) => void }
type AccessRole = InstitutionSettings['accessControl']['roles'][number]
type AccessUser = InstitutionSettings['accessControl']['users'][number]

export default function UserPermissions({ settings, onSave }: Props) {
  const [draft, setDraft] = useState(settings)
  const [selectedRoleId, setSelectedRoleId] = useState(draft.accessControl.roles[0]?.id ?? '')
  const [query, setQuery] = useState('')
  const [creatingRole, setCreatingRole] = useState<AccessRole | null>(null)
  const [creatingUser, setCreatingUser] = useState<AccessUser | null>(null)
  const [notice, setNotice] = useState('')
  const roles = draft.accessControl.roles
  const users = draft.accessControl.users
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0]
  const filteredUsers = useMemo(() => users.filter((user) => `${user.name} ${user.email} ${user.area}`.toLowerCase().includes(query.toLowerCase())), [users, query])

  function updateAccess(patch: Partial<InstitutionSettings['accessControl']>) {
    setDraft((current) => ({ ...current, accessControl: { ...current.accessControl, ...patch } }))
    setNotice('')
  }

  function updateRole(patch: Partial<AccessRole>) {
    if (!selectedRole) return
    updateAccess({ roles: roles.map((role) => role.id === selectedRole.id ? { ...role, ...patch } : role) })
  }

  function togglePermission(section: string) {
    if (!selectedRole) return
    const permissions = selectedRole.permissions.includes(section) ? selectedRole.permissions.filter((item) => item !== section) : [...selectedRole.permissions, section]
    updateRole({ permissions })
  }

  function setAllPermissions(enabled: boolean) { updateRole({ permissions: enabled ? [...allPermissionSections] : [] }) }

  function setUserRole(userId: string, roleId: string) {
    updateAccess({ users: users.map((user) => user.id === userId ? { ...user, roleId } : user) })
    setNotice('Rol actualizado. Guarda los cambios para aplicarlo en el próximo acceso.')
  }

  function newRole() { setCreatingRole({ id: `role-${Date.now()}`, name: 'Nuevo rol', description: 'Describe las responsabilidades de este rol.', permissions: ['Resumen'], status: 'Activo' }) }
  function createRole() {
    if (!creatingRole?.name.trim()) return
    updateAccess({ roles: [...roles, creatingRole] }); setSelectedRoleId(creatingRole.id); setCreatingRole(null); setNotice('Rol creado. Ahora configura sus accesos.')
  }
  function newUser() { setCreatingUser({ id: `user-${Date.now()}`, name: '', email: '', roleId: roles[0]?.id ?? '', area: '', status: 'Activo' }) }
  function createUser() {
    if (!creatingUser?.name.trim() || !creatingUser.email.trim()) return
    updateAccess({ users: [creatingUser, ...users] }); setCreatingUser(null); setNotice('Usuario agregado y rol asignado.')
  }
  function save() { onSave(draft); setNotice('Usuarios y permisos guardados en este navegador.') }

  return <section className="permissions-module">
    <div className="module-heading"><div><p className="date-label">SEGURIDAD Y ACCESO</p><h1>Usuarios y permisos</h1><p>Define qué puede consultar cada equipo sin exponer módulos que no necesita.</p></div><button className="primary-button compact" type="button" onClick={newUser}><Plus size={16} /> Agregar usuario</button></div>
    <div className="permissions-summary"><article><span><Users size={20} /></span><div><small>Usuarios administrativos</small><strong>{users.length + 1}</strong><em>incluye administrador institucional</em></div></article><article><span><ShieldCheck size={20} /></span><div><small>Roles configurados</small><strong>{roles.length}</strong><em>permisos personalizados</em></div></article><article><span><KeyRound size={20} /></span><div><small>Accesos disponibles</small><strong>{allPermissionSections.length}</strong><em>secciones asignables</em></div></article></div>
    <div className="admin-owner-note"><span><ShieldCheck size={19} /></span><div><strong>Administrador institucional</strong><p>El área de Sistemas conserva acceso total y exclusivo a personalización, usuarios y permisos. Este acceso no puede limitarse desde otros roles.</p></div><i>Acceso total</i></div>
    <div className="permissions-layout">
      <aside className="roles-panel"><header><div><h2>Roles</h2><p>Perfiles de acceso</p></div><button type="button" aria-label="Crear rol" onClick={newRole}><Plus size={17} /></button></header><div>{roles.map((role) => <button type="button" key={role.id} className={role.id === selectedRole?.id ? 'active' : ''} onClick={() => setSelectedRoleId(role.id)}><span><UserCog size={17} /></span><p><strong>{role.name}</strong><small>{role.permissions.length} secciones · {users.filter((user) => user.roleId === role.id).length} usuarios</small></p></button>)}</div></aside>
      {selectedRole && <article className="permission-editor"><header><div><span>CONFIGURACIÓN DEL ROL</span><input value={selectedRole.name} onChange={(event) => updateRole({ name: event.target.value })} /><textarea rows={2} value={selectedRole.description} onChange={(event) => updateRole({ description: event.target.value })} /></div><label>Estatus<select value={selectedRole.status} onChange={(event) => updateRole({ status: event.target.value })}><option>Activo</option><option>Inactivo</option></select></label></header><div className="permission-actions"><div><strong>Secciones visibles</strong><p>La sidebar y las rutas se adaptarán a esta selección.</p></div><span><button type="button" onClick={() => setAllPermissions(true)}>Seleccionar todas</button><button type="button" onClick={() => setAllPermissions(false)}>Limpiar</button></span></div><div className="permission-groups">{permissionGroups.map((group) => <section key={group.name}><h3>{group.name}</h3><div>{group.sections.map((section) => <label key={section}><input type="checkbox" checked={selectedRole.permissions.includes(section)} onChange={() => togglePermission(section)} /><span><CheckCircle2 size={16} /><b>{section}</b></span></label>)}</div></section>)}</div></article>}
    </div>
    <article className="users-panel"><header><div><h2>Usuarios administrativos</h2><p>Asigna un rol; los cambios se aplicarán en el próximo acceso del usuario.</p></div><label><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar usuario o área" /></label></header><div className="users-table-wrap"><table><thead><tr><th>Usuario</th><th>Área</th><th>Rol asignado</th><th>Accesos</th><th>Estatus</th></tr></thead><tbody>{filteredUsers.map((user) => { const role = roles.find((item) => item.id === user.roleId); return <tr key={user.id}><td><strong>{user.name}</strong><small>{user.email}</small></td><td>{user.area}</td><td><select value={user.roleId} onChange={(event) => setUserRole(user.id, event.target.value)}>{roles.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></td><td>{role?.permissions.length ?? 0} secciones</td><td><span className={user.status === 'Activo' ? 'active' : ''}>{user.status}</span></td></tr> })}</tbody></table></div></article>
    <footer className="permissions-savebar"><span role="status">{notice || 'Sólo el administrador institucional puede modificar estos accesos.'}</span><button type="button" onClick={save}><Save size={16} /> Guardar permisos</button></footer>
    {creatingRole && <div className="permission-modal-layer" role="dialog" aria-modal="true"><button className="permission-backdrop" aria-label="Cerrar" onClick={() => setCreatingRole(null)} /><form className="permission-modal" onSubmit={(event) => { event.preventDefault(); createRole() }}><header><div><span>NUEVO PERFIL</span><h2>Crear rol</h2><p>Después podrás seleccionar todas sus secciones.</p></div><button type="button" aria-label="Cerrar" onClick={() => setCreatingRole(null)}><X size={19} /></button></header><label>Nombre del rol<input required value={creatingRole.name} onChange={(event) => setCreatingRole({ ...creatingRole, name: event.target.value })} /></label><label>Descripción<textarea rows={4} value={creatingRole.description} onChange={(event) => setCreatingRole({ ...creatingRole, description: event.target.value })} /></label><footer><button type="button" onClick={() => setCreatingRole(null)}>Cancelar</button><button type="submit">Crear rol</button></footer></form></div>}
    {creatingUser && <div className="permission-modal-layer" role="dialog" aria-modal="true"><button className="permission-backdrop" aria-label="Cerrar" onClick={() => setCreatingUser(null)} /><form className="permission-modal" onSubmit={(event) => { event.preventDefault(); createUser() }}><header><div><span>NUEVO USUARIO</span><h2>Agregar usuario</h2><p>Asigna su acceso administrativo inicial.</p></div><button type="button" aria-label="Cerrar" onClick={() => setCreatingUser(null)}><X size={19} /></button></header><label>Nombre completo<input required value={creatingUser.name} onChange={(event) => setCreatingUser({ ...creatingUser, name: event.target.value })} /></label><label>Correo institucional<input required type="email" value={creatingUser.email} onChange={(event) => setCreatingUser({ ...creatingUser, email: event.target.value })} /></label><div className="permission-modal-fields"><label>Área<input value={creatingUser.area} onChange={(event) => setCreatingUser({ ...creatingUser, area: event.target.value })} /></label><label>Rol<select value={creatingUser.roleId} onChange={(event) => setCreatingUser({ ...creatingUser, roleId: event.target.value })}>{roles.map((role) => <option value={role.id} key={role.id}>{role.name}</option>)}</select></label></div><footer><button type="button" onClick={() => setCreatingUser(null)}>Cancelar</button><button type="submit">Agregar usuario</button></footer></form></div>}
  </section>
}
