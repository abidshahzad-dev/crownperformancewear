import { z } from "zod";
import type { Field } from "@/lib/cms/schema";

/** Builds a zod validator from CMS field definitions so saved page content always matches the schema. */
export function zodForFields(fields: Field[]): z.ZodObject<Record<string, z.ZodType>> {
  const shape: Record<string, z.ZodType> = {};
  for (const field of fields) shape[field.name] = zodForField(field);
  return z.object(shape);
}

function zodForField(field: Field): z.ZodType {
  switch (field.type) {
    case "text":
      return z.string().max(500).optional().default("");
    case "textarea":
      return z.string().max(5000).optional().default("");
    case "markdown":
      return z.string().max(60000).optional().default("");
    case "image":
      return z
        .string()
        .max(2000)
        .refine((v) => v === "" || /^https?:\/\//.test(v), `${field.label}: enter a full http(s) URL.`)
        .optional()
        .default("");
    case "link":
      return z
        .object({ label: z.string().max(120).default(""), href: z.string().max(1000).default("") })
        .optional()
        .default({ label: "", href: "" });
    case "strings":
      return z.array(z.string().trim().max(300)).max(100).optional().default([]);
    case "list":
      return z.array(zodForFields(field.fields)).max(100).optional().default([]);
  }
}
