export type SchoolDocument = { id: string; ownerType: 'student' | 'applicant'; ownerId: string; name: string; physical: boolean; receivedDate: string; receivedBy: string; reviewed: boolean; notes: string; fileName: string; blob?: Blob; createdAt: string }
async function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('campusone-documents', 1)
    request.onupgradeneeded = () => { request.result.createObjectStore('documents', { keyPath: 'id' }) }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('No se pudo abrir el almacén de documentos.'))
    request.onblocked = () => reject(new Error('Otra pestaña está bloqueando el almacén de documentos.'))
  })
}
export async function listDocuments(ownerType: SchoolDocument['ownerType'], ownerId: string) {
  const db = await database()
  try { return await new Promise<SchoolDocument[]>((resolve, reject) => { const request = db.transaction('documents').objectStore('documents').getAll(); request.onsuccess = () => resolve((request.result as SchoolDocument[]).filter((item) => item.ownerId === ownerId && item.ownerType === ownerType)); request.onerror = () => reject(new Error('No se pudieron leer los documentos.')) }) }
  finally { db.close() }
}
export async function validateAttachment(file: File) {
  if (file.size === 0 || file.size > 10 * 1024 * 1024) throw new Error('El archivo debe tener contenido y pesar como máximo 10 MB.')
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer())
  const pdf = [37, 80, 68, 70, 45].every((byte, index) => bytes[index] === byte)
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte)
  const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
  if (!pdf && !png && !jpg) throw new Error('Solo se admiten archivos PDF, PNG y JPEG. El contenido no coincide con un formato permitido.')
}
export async function saveDocument(document: SchoolDocument) {
  if (!document.ownerId || !document.name.trim() || (!document.physical && !document.blob)) throw new Error('Registra un archivo digital o la recepción del documento físico.')
  if (document.physical && (!document.receivedDate || !document.receivedBy.trim())) throw new Error('La recepción física necesita fecha y nombre del responsable.')
  const db = await database()
  try { await new Promise<void>((resolve, reject) => { const transaction = db.transaction('documents', 'readwrite'); transaction.objectStore('documents').put(document); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(new Error('No se pudo guardar el documento. Revisa el espacio del navegador.')); transaction.onabort = () => reject(new Error('El guardado fue cancelado; el documento anterior se conservó.')) }) }
  finally { db.close() }
}
