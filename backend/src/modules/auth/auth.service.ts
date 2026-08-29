import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { query } from '../../database/postgres';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { User, UserRole } from '@medikiosk/shared-types';
import { JwtPayload } from '../../middleware/auth';

export class AuthService {
  public static async login(email: string, passwordPlain: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // 1. Fetch user from DB
    const userRes = await query(
      `SELECT u.id, u.email, u.password_hash, u.full_name, u.is_active, u.hospital_id, u.department, u.created_at, u.updated_at,
              COALESCE(json_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), '[]'::json) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       WHERE LOWER(u.email) = LOWER($1)
       GROUP BY u.id`,
      [email]
    );

    const row = userRes.rows[0];
    if (!row) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!row.is_active) {
      throw new AppError('Account is disabled. Please contact administrator.', 403, 'ACCOUNT_DISABLED');
    }

    // 2. Verify password with bcrypt
    const passwordMatch = await bcrypt.compare(passwordPlain, row.password_hash);
    if (!passwordMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const user: User = {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      roles: (row.roles || []) as UserRole[],
      isActive: row.is_active,
      hospitalId: row.hospital_id,
      department: row.department,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };

    // 3. Issue Tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
      hospitalId: user.hospitalId,
    };

    const signOptions: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as unknown as number };
    const refreshSignOptions: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as unknown as number };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, signOptions);
    const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, refreshSignOptions);

    return { user, accessToken, refreshToken };
  }

  public static async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
      const userRes = await query(
        `SELECT u.id, u.email, u.full_name, u.is_active, u.hospital_id, u.department,
                COALESCE(json_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), '[]'::json) as roles
         FROM users u
         LEFT JOIN user_roles ur ON u.id = ur.user_id
         WHERE u.id = $1
         GROUP BY u.id`,
        [decoded.userId]
      );

      const row = userRes.rows[0];
      if (!row || !row.is_active) {
        throw new AppError('User not found or inactive', 401, 'INVALID_TOKEN');
      }

      const payload: JwtPayload = {
        userId: row.id,
        email: row.email,
        roles: (row.roles || []) as UserRole[],
        hospitalId: row.hospital_id,
      };

      const signOptions: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as unknown as number };
      const accessToken = jwt.sign(payload, env.JWT_SECRET, signOptions);
      return { accessToken };
    } catch (err) {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  public static async getUserById(userId: string): Promise<User> {
    const userRes = await query(
      `SELECT u.id, u.email, u.full_name, u.is_active, u.hospital_id, u.department, u.created_at, u.updated_at,
              COALESCE(json_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), '[]'::json) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [userId]
    );

    const row = userRes.rows[0];
    if (!row) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      roles: (row.roles || []) as UserRole[],
      isActive: row.is_active,
      hospitalId: row.hospital_id,
      department: row.department,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}
