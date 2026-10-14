import { z } from "zod";
import { isValidCnic, isValidPkPhone } from "@/lib/phone";

export const clientStep1Schema = z.object({
  full_name:           z.string().min(2, "Minimum 2 characters").max(120),
  father_husband_name: z.string().max(120).optional().or(z.literal("")),
  cnic:                z
    .string()
    .optional()
    .refine(v => !v || isValidCnic(v), { message: "Format: 35201-1234567-1" }),
  phone:               z
    .string()
    .min(1, "Phone is required")
    .refine(isValidPkPhone, { message: "Enter a valid Pakistani mobile number" }),
  whatsapp_same:       z.boolean().default(true),
  whatsapp:            z.string().optional(),
  email:               z.string().email("Invalid email").optional().or(z.literal("")),
  address:             z.string().max(300).optional().or(z.literal("")),
  city:                z.string().optional().or(z.literal("")),
}).superRefine((d, ctx) => {
  if (!d.whatsapp_same && d.whatsapp && !isValidPkPhone(d.whatsapp)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["whatsapp"],
      message: "Enter a valid Pakistani mobile number",
    });
  }
});

export type ClientStep1Data = z.infer<typeof clientStep1Schema>;

/** Stored draft key in localStorage */
export const CLIENT_DRAFT_KEY = "mzm_client_draft";
