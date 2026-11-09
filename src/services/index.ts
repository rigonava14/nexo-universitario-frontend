import type { Applicant } from '../admissions'
import type { Role } from '../auth'
import type { DirectoryKind, DirectoryRecord } from '../directory'
import type { SchoolDocument } from '../document-store'
import type { InstitutionSettings } from '../institution'
import type { Operations } from '../operations'
import type { SchoolData } from '../school'
import type { Loaded, Saved } from './types'
import { localAdmissionsService } from './local/admissions'
import { localDirectoryService } from './local/directory'
import { localDocumentService } from './local/documents'
import { localInstitutionService } from './local/institution'
import { localOperationsService } from './local/operations'
import { localSchoolService } from './local/school'
import { localSessionService } from './local/session'

/*
 * Capa de servicios (ADR 0001). Las pantallas usan hooks que llaman a estos servicios; nunca tocan
 * almacenamiento. Hoy todos los adaptadores son locales (navegador); en la fase 1 se agrega el adaptador
 * de API y solo cambia este registro.
 */

export interface InstitutionService {
  load(): Promise<InstitutionSettings>
  save(settings: InstitutionSettings): Promise<void>
  reset(): Promise<InstitutionSettings>
}

/** Sesión síncrona mientras sea de demostración; pasa a asíncrona con la autenticación real (sprint 3). */
export interface SessionService {
  getRole(): Role | null
  getCurrentEmail(): string | null
  signIn(email: string, password: string): Role | null
  signOut(): void
}

export interface DirectoryService {
  load(kind: DirectoryKind): Promise<Loaded<DirectoryRecord[]>>
  save(kind: DirectoryKind, records: DirectoryRecord[], expectedVersion: string | null): Promise<Saved>
}

export interface OperationsService {
  load(): Promise<Loaded<Operations>>
  save(data: Operations, expectedVersion: string | null): Promise<Saved>
}

export interface SchoolService {
  load(settings: InstitutionSettings): Promise<Loaded<SchoolData>>
  save(data: SchoolData, expectedVersion: string | null): Promise<Saved>
}

export interface AdmissionsService {
  list(): Promise<Applicant[]>
  save(applicants: Applicant[]): Promise<void>
}

export interface DocumentService {
  list(ownerType: SchoolDocument['ownerType'], ownerId: string): Promise<SchoolDocument[]>
  save(document: SchoolDocument): Promise<void>
}

export const services = {
  institution: localInstitutionService as InstitutionService,
  session: localSessionService as SessionService,
  directory: localDirectoryService as DirectoryService,
  operations: localOperationsService as OperationsService,
  school: localSchoolService as SchoolService,
  admissions: localAdmissionsService as AdmissionsService,
  documents: localDocumentService as DocumentService,
}

export type { Loaded, Saved } from './types'
