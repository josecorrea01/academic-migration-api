const { z } = require("zod");

const STATUS = z.enum(["DRAFT", "SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED"]);

const createApplicationSchema = z.object({
  body: z.object({
    applicantName: z.string().min(1).max(120),
    applicantEmail: z.string().email().max(200),
    originInstitution: z.string().min(1).max(200),
    targetInstitution: z.string().min(1).max(200),

    originProgram: z.string().max(200).optional(),
    targetProgram: z.string().max(200).optional(),
    year: z.number().int().min(2000).max(2100).optional(),
    requestedSemester: z.number().int().min(1).max(2).optional(),
    notes: z.string().max(1000).optional()
  })
});

const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    status: STATUS
  })
});

module.exports = { createApplicationSchema, updateStatusSchema };