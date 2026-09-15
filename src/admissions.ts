export const admissionStatuses = [
  'Registro iniciado',
  'Documentos en revisión',
  'Datos validados',
  'Pago de examen pendiente',
  'Examen programado',
  'Evaluación en proceso',
  'Aceptado',
  'No aceptado',
  'Inscrito',
] as const

export type AdmissionStatus = typeof admissionStatuses[number]

export type Applicant = {
  id: string
  name: string
  email: string
  phone: string
  curp: string
  career: string
  campus: string
  status: AdmissionStatus
  registeredAt: string
  examDate?: string
  score?: number
  applicationFile?: string
  paymentReference?: string
  dataValidated: boolean
}

export const careers = [
  'Ingeniería en Sistemas Computacionales',
  'Ingeniería Industrial',
  'Ingeniería Mecatrónica',
  'Ingeniería en Gestión Empresarial',
  'Contador Público',
]

export const initialApplicants: Applicant[] = [
  {
    id: 'ASP-2026-0148',
    name: 'Mariana Torres García',
    email: 'mariana.torres@email.com',
    phone: '636 123 4567',
    curp: 'TOGM080315MCHRRA09',
    career: careers[0],
    campus: 'Campus Central',
    status: 'Aceptado',
    registeredAt: '12 sep 2026',
    examDate: '28 sep 2026 · 09:00 h',
    score: 86,
    applicationFile: 'FIC-2026-0148',
    paymentReference: 'EXA-260148-8471',
    dataValidated: true,
  },
  {
    id: 'ASP-2026-0152',
    name: 'Diego Hernández Ruiz',
    email: 'diego.h@email.com',
    phone: '636 401 2892',
    curp: 'HERD080721HCHRZG05',
    career: careers[2],
    campus: 'Campus Central',
    status: 'Documentos en revisión',
    registeredAt: '13 sep 2026',
    dataValidated: false,
  },
  {
    id: 'ASP-2026-0156',
    name: 'Sofía Mendoza López',
    email: 'sofia.mendoza@email.com',
    phone: '636 208 1143',
    curp: 'MELS080113MCHNPS02',
    career: careers[1],
    campus: 'Campus Central',
    status: 'Pago de examen pendiente',
    registeredAt: '14 sep 2026',
    applicationFile: 'FIC-2026-0156',
    paymentReference: 'EXA-260156-3194',
    dataValidated: true,
  },
  {
    id: 'ASP-2026-0159',
    name: 'Emiliano Chávez Ortiz',
    email: 'emiliano.chavez@email.com',
    phone: '636 388 6901',
    curp: 'CAOE080429HCHHRM04',
    career: careers[3],
    campus: 'Campus Central',
    status: 'Examen programado',
    registeredAt: '14 sep 2026',
    examDate: '30 sep 2026 · 11:30 h',
    applicationFile: 'FIC-2026-0159',
    paymentReference: 'EXA-260159-7432',
    dataValidated: true,
  },
]

const STORAGE_KEY = 'nexo-applicants'

export function loadApplicants(): Applicant[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : initialApplicants
  } catch {
    return initialApplicants
  }
}

export function saveApplicants(applicants: Applicant[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applicants))
}

export function createApplicant(data: Pick<Applicant, 'name' | 'email' | 'phone' | 'curp' | 'career' | 'campus'>): Applicant {
  const number = Math.floor(160 + Math.random() * 800)
  return {
    ...data,
    id: `ASP-2026-${number.toString().padStart(4, '0')}`,
    status: 'Documentos en revisión',
    registeredAt: new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
    dataValidated: false,
  }
}
