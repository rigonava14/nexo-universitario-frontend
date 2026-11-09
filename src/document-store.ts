export type SchoolDocument = {
  id: string
  ownerType: 'student' | 'applicant'
  ownerId: string
  name: string
  physical: boolean
  receivedDate: string
  receivedBy: string
  reviewed: boolean
  notes: string
  fileName: string
  blob?: Blob
  createdAt: string
}
export async function validateAttachment(file: File) {
  if (file.size === 0 || file.size > 10 * 1024 * 1024)
    throw new Error('El archivo debe tener contenido y pesar como máximo 10 MB.')
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer())
  const pdf = [37, 80, 68, 70, 45].every((byte, index) => bytes[index] === byte)
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte)
  const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
  if (!pdf && !png && !jpg)
    throw new Error('Solo se admiten archivos PDF, PNG y JPEG. El contenido no coincide con un formato permitido.')
}

/** Regla de negocio: un documento necesita archivo digital o recepción física con fecha y responsable. */
export function documentError(document: SchoolDocument) {
  if (!document.ownerId || !document.name.trim() || (!document.physical && !document.blob))
    return 'Registra un archivo digital o la recepción del documento físico.'
  if (document.physical && (!document.receivedDate || !document.receivedBy.trim()))
    return 'La recepción física necesita fecha y nombre del responsable.'
  return ''
}
