// auth.controller.ts — Controller for user authentication; handles registration, login, and profile management.
import { Request, Response } from 'express';
import { signToken } from '../../shared/token.service';
import { sendSuccess } from '../../shared/response';
import { AppError } from '../../shared/errorHandler';
import {
  findUserByEmailWithPassword,
  findUserByEmail,
  findUserById,
  countUsers,
  createUser,
  updateUserById,
} from './auth.service';
import {
  LoginBody,
  RegisterBody,
  UpdateProfileBody,
  AuthResponse,
  UserRole,
} from './auth.types';
import { IUser } from './auth.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds the public auth response shape sent after login / register.
 * @param user - User document
 * @returns Token and user profile data
 */
function buildAuthResponse(user: IUser): AuthResponse {
  return {
    token: signToken(user._id.toString()),
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      position: user.position,
      phone: user.phone,
      birth: user.birth,
    },
  };
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

/**
 * Registers a new user and returns an auth token.
 * @param req - Express Request
 * @param res - Express Response
 */
export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, position, phone, birth } =
    req.body as RegisterBody;

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AppError('An account with this email already exists', 400);
  }

  const userCount = await countUsers();
  const role: UserRole = userCount === 0 ? UserRole.Admin : UserRole.User;

  const user = await createUser({ name, email, password, position, phone, birth }, role);
  sendSuccess(res, buildAuthResponse(user), 'Account created successfully', 201);
}

/**
 * Authenticates a user and returns an auth token.
 * @param req - Express Request
 * @param res - Express Response
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginBody;

  // We need the password hash here — service opts in with select('+password')
  const user = await findUserByEmailWithPassword(email);
  if (!user) {
    // Same message for both "not found" and "wrong password" — avoids user enumeration
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // Re-fetch without password for the response (createUser already does this,
  // but login gets the password-inclusive doc above)
  const safeUser = await findUserById(user._id);
  if (!safeUser) throw new AppError('User not found', 404);

  sendSuccess(res, buildAuthResponse(safeUser), 'Login successful');
}

/**
 * Retrieves the currently authenticated user's profile.
 * @param req - Express Request
 * @param res - Express Response
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  // req.user is attached by authMiddleware — already stripped of password
  sendSuccess(res, req.user);
}

/**
 * Updates the currently authenticated user's profile.
 * @param req - Express Request
 * @param res - Express Response
 */
export async function updateMe(req: Request, res: Response): Promise<void> {
  const updates = req.body as UpdateProfileBody;
  const updated = await updateUserById(req.user._id, updates);
  if (!updated) throw new AppError('User not found', 404);
  sendSuccess(res, updated, 'Profile updated');
}
