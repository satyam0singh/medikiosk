import { query } from '../../database/postgres';
import { DoctorSpecialist, UserRole } from '@medikiosk/shared-types';
import { AppError } from '../../middleware/errorHandler';

export const INITIAL_SPECIALISTS: DoctorSpecialist[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'dr.sharma@aiia.gov.in',
    fullName: 'Dr. Rajesh Sharma',
    role: UserRole.PHYSICIAN,
    department: 'General Medicine',
    specialtyTitle: 'Consultant Physician • MD',
    roomNumber: 'Room #04',
    isActive: true,
    availableSlotCount: 14,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    email: 'dr.vaidya@aiia.gov.in',
    fullName: 'Dr. Anand Vaidya',
    role: UserRole.AYUSH_PRACTITIONER,
    department: 'Kayachikitsa / AYUSH',
    specialtyTitle: 'Senior AYUSH Specialist • BAMS MD',
    roomNumber: 'Room #07',
    isActive: true,
    availableSlotCount: 18,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    email: 'dr.priya.cardio@aiia.gov.in',
    fullName: 'Dr. Priya Nair',
    role: UserRole.PHYSICIAN,
    department: 'Cardiology',
    specialtyTitle: 'Cardiologist • DM Cardiology',
    roomNumber: 'Room #02',
    isActive: true,
    availableSlotCount: 8,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000006',
    email: 'dr.menon.ortho@aiia.gov.in',
    fullName: 'Dr. Suresh Menon',
    role: UserRole.PHYSICIAN,
    department: 'Orthopedics',
    specialtyTitle: 'Orthopedic Consultant • MS Ortho',
    roomNumber: 'Room #05',
    isActive: true,
    availableSlotCount: 12,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000007',
    email: 'dr.patel.chest@aiia.gov.in',
    fullName: 'Dr. Vikram Patel',
    role: UserRole.PHYSICIAN,
    department: 'Pulmonology',
    specialtyTitle: 'Chest Physician • MD Pulm',
    roomNumber: 'Room #03',
    isActive: true,
    availableSlotCount: 10,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000008',
    email: 'dr.roy.gastro@aiia.gov.in',
    fullName: 'Dr. Ananya Roy',
    role: UserRole.PHYSICIAN,
    department: 'Gastroenterology',
    specialtyTitle: 'Gastroenterologist • DM Gastro',
    roomNumber: 'Room #06',
    isActive: true,
    availableSlotCount: 11,
  },
];

export interface CreateDoctorInput {
  fullName: string;
  email: string;
  department: string;
  specialtyTitle?: string;
  roomNumber?: string;
  role?: UserRole;
}

export class DoctorsService {
  public static async listAll(department?: string): Promise<DoctorSpecialist[]> {
    try {
      const res = await query(
        `SELECT u.id, u.email, u.full_name, u.department, u.is_active, r.role
         FROM users u
         LEFT JOIN user_roles r ON u.id = r.user_id
         WHERE u.is_active = TRUE
         ORDER BY u.full_name ASC`
      );

      if (res.rows.length === 0) {
        return department
          ? INITIAL_SPECIALISTS.filter((s) => s.department.toLowerCase().includes(department.toLowerCase()))
          : INITIAL_SPECIALISTS;
      }

      const mapped: DoctorSpecialist[] = res.rows.map((row) => {
        const seedMatch = INITIAL_SPECIALISTS.find((s) => s.email === row.email);
        return {
          id: row.id,
          email: row.email,
          fullName: row.full_name,
          role: (row.role as UserRole) || UserRole.PHYSICIAN,
          department: row.department || seedMatch?.department || 'General Medicine',
          specialtyTitle: seedMatch?.specialtyTitle || `Specialist • ${row.department || 'MD'}`,
          roomNumber: seedMatch?.roomNumber || 'Room #04',
          isActive: row.is_active,
          availableSlotCount: seedMatch?.availableSlotCount || 10,
        };
      });

      // Merge with initial specialists if not in DB
      for (const spec of INITIAL_SPECIALISTS) {
        if (!mapped.some((m) => m.email === spec.email)) {
          mapped.push(spec);
        }
      }

      if (department && department !== 'ALL') {
        return mapped.filter((d) => d.department.toLowerCase().includes(department.toLowerCase()));
      }

      return mapped;
    } catch (err) {
      console.warn('Doctors list database fallback to synthetic directory:', err);
      if (department && department !== 'ALL') {
        return INITIAL_SPECIALISTS.filter((d) => d.department.toLowerCase().includes(department.toLowerCase()));
      }
      return INITIAL_SPECIALISTS;
    }
  }

  public static async create(input: CreateDoctorInput): Promise<DoctorSpecialist> {
    const existing = await query('SELECT id FROM users WHERE email = $1', [input.email]);
    if (existing.rows.length > 0) {
      throw new AppError(`Doctor with email ${input.email} already exists`, 409, 'DOCTOR_EXISTS');
    }

    const defaultPasswordHash = '$2a$12$eA.XhV1aB0QfKkU6yD.6.uWfDpvqF59XFpU1wZ1HnFkI9tIeDk8c6'; // "Medikiosk@2026"
    const userRes = await query(
      `INSERT INTO users (email, password_hash, full_name, is_active, hospital_id, department)
       VALUES ($1, $2, $3, TRUE, 'AIIA-ND-01', $4)
       RETURNING id, email, full_name, department, is_active`,
      [input.email, defaultPasswordHash, input.fullName, input.department]
    );

    const user = userRes.rows[0];
    if (!user) {
      throw new AppError('Failed to create doctor record', 500, 'CREATION_FAILED');
    }
    const role = input.role || (input.department.includes('AYUSH') ? UserRole.AYUSH_PRACTITIONER : UserRole.PHYSICIAN);

    await query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [user.id, role]
    );

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role,
      department: user.department,
      specialtyTitle: input.specialtyTitle || `Consultant • ${user.department}`,
      roomNumber: input.roomNumber || 'Room #08',
      isActive: user.is_active,
      availableSlotCount: 15,
    };
  }

  public static async getById(id: string): Promise<DoctorSpecialist> {
    const all = await this.listAll();
    const found = all.find((d) => d.id === id);
    if (!found) {
      throw new AppError(`Doctor specialist not found with id ${id}`, 404, 'DOCTOR_NOT_FOUND');
    }
    return found;
  }
}
