const { z } = require("zod");

const STATUS = z.enum(["DRAFT", "SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED"]);

// helper: convierte strings numéricos (ej: "2024") a number, pero deja undefined si viene vacío
const toInt = (val) => {
  if (val === undefined || val === null || val === "") return undefined;
  const n = Number(val);
  return Number.isNaN(n) ? val : n;
};

// ✅ Schema por fila (item) para migración/bulk
const applicationItemSchema = z.object({
  externalId: z.string().trim().min(1).max(100).optional(),

  applicantName: z.string().trim().min(1).max(120),
  applicantEmail: z
    .string()
    .trim()
    .email()
    .max(200)
    .transform((s) => s.toLowerCase()),

  originInstitution: z.string().trim().min(1).max(200),
  targetInstitution: z.string().trim().min(1).max(200),

  originProgram: z.string().trim().max(200).optional(),
  targetProgram: z.string().trim().max(200).optional(),

  year: z.preprocess(toInt, z.number().int().min(2000).max(2100)).optional(),
  requestedSemester: z.preprocess(toInt, z.number().int().min(1).max(2)).optional(),

  status: STATUS.optional(),
  notes: z.string().trim().max(1000).optional()
});

// ✅ POST normal (sin status/externalId: lo controla el sistema)
const createApplicationSchema = z.object({
  body: applicationItemSchema.omit({ status: true, externalId: true })
});

// ✅ PATCH status
const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    status: STATUS
  })
});

// ✅ Bulk Import con metadata (Opción B)
// Validamos metadata aquí; items se validan por fila con applicationItemSchema (para reportar errores por índice)
const bulkImportSchema = z.object({
  body: z.object({
    batchId: z.string().trim().min(1).max(80),
    source: z.string().trim().max(80).optional(),
    dryRun: z.boolean().optional().default(false),
    mode: z.enum(["insert", "upsert"]).optional().default("insert"),
    items: z.array(z.unknown()).min(1).max(2000)
  })
});

module.exports = {
  STATUS,
  applicationItemSchema,
  createApplicationSchema,
  updateStatusSchema,
  bulkImportSchema
};