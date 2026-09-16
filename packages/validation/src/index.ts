import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  firstName: z.string().min(2, { message: 'First name is required' }),
  lastName: z.string().min(2, { message: 'Last name is required' }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid E.164 phone number format' }),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const OtpVerificationSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  code: z.string().length(6, { message: 'OTP must be 6 digits' }),
});

export const CartItemAddSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().positive(),
  options: z.record(z.string()).optional(),
  addons: z.array(z.string().uuid()).optional(),
});

export const CreateOrderSchema = z.object({
  restaurantId: z.string().uuid(),
  deliveryAddressId: z.string().uuid(),
  idempotencyKey: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

export const LocationUpdateSchema = z.object({
  orderId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  heading: z.number().min(0).max(360).optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CartItemAddInput = z.infer<typeof CartItemAddSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type LocationUpdateInput = z.infer<typeof LocationUpdateSchema>;