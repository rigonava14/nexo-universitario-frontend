import { SchoolDocument, documentError } from '../../document-store'
import type { DocumentService } from '../index'

async function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('campusone-documents', 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore('documents', { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('No se pudo abrir el almacén de documentos.'))
    request.onblocked = () => reject(new Error('Otra pestaña está bloqueando el almacén de documentos.'))
  })
}
async function listDocuments(ownerType: SchoolDocument['ownerType'], ownerId: string) {
  const db = await database()
  try {
    return await new Promise<SchoolDocument[]>((resolve, reject) => {
      const request = db.transaction('documents').objectStore('documents').getAll()
      request.onsuccess = () =>
        resolve(
          (request.result as SchoolDocument[]).filter(
            (item) => item.ownerId === ownerId && item.ownerType === ownerType,
          ),
        )
      request.onerror = () => reject(new Error('No se pudieron leer los documentos.'))
    })
  } finally {
    db.close()
  }
}

async function saveDocument(document: SchoolDocument) {
  const error = documentError(document)
  if (error) throw new Error(error)
  const db = await database()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('documents', 'readwrite')
      transaction.objectStore('documents').put(document)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(new Error('No se pudo guardar el documento. Revisa el espacio del navegador.'))
      transaction.onabort = () => reject(new Error('El guardado fue cancelado; el documento anterior se conservó.'))
    })
  } finally {
    db.close()
  }
}

export const localDocumentService: DocumentService = { list: listDocuments, save: saveDocument }
