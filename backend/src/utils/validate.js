import { z } from "zod";

export const jobCreateSchema = z.object({
  name: z.string().min(2).max(60),
  companyName: z.string().max(80).optional().or(z.literal("")),
  phone: z.string().min(6).max(30),
  email: z.string().email(),
  city: z.string().min(2).max(60),
  jobRole: z.string().min(2).max(80),
  description: z.string().min(5).max(2000),
  urgent: z.boolean().optional().default(false)
});

export const jobUpdateSchema = z.object({
  companyName: z.string().max(80).optional().or(z.literal("")),
  phone: z.string().min(6).max(30).optional(),
  city: z.string().min(2).max(60).optional(),
  jobRole: z.string().min(2).max(80).optional(),
  description: z.string().min(5).max(2000).optional(),
  urgent: z.boolean().optional()
});

export const jobDeleteSchema = z.object({
  email: z.string().email()
});

export const tokenUpsertSchema = z.object({
  token: z.string().min(20),
  roles: z.array(z.string().min(1)).default([]),
  newsEnabled: z.boolean().default(true)
});
