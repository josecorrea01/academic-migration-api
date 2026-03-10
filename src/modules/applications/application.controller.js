const Application = require("./application.model");
const { STATUS } = require("./application.model");
const { applicationItemSchema } = require("./application.validation");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
}

async function createApplication(req, res, next) {
  try {
    const body = req.validated?.body ?? req.body ?? {}; // evita destructuring sobre undefined

    const {
      applicantName,
      applicantEmail,
      originInstitution,
      targetInstitution,
      originProgram,
      targetProgram,
      year,
      requestedSemester,
      notes
    } = body;

    // Validación mínima (Zod ya valida, esto es extra)
    if (!applicantName || !applicantEmail || !originInstitution || !targetInstitution) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: applicantName, applicantEmail, originInstitution, targetInstitution"
      });
    }

    if (!isValidEmail(applicantEmail)) {
      return res.status(400).json({ success: false, message: "Invalid applicantEmail format" });
    }

    const app = await Application.create({
      applicantName,
      applicantEmail,
      originInstitution,
      targetInstitution,
      originProgram,
      targetProgram,
      year,
      requestedSemester,
      notes
    });

    return res.status(201).json({ success: true, data: app });
  } catch (err) {
    next(err);
  }
}

async function listApplications(req, res, next) {
  try {
    const { status, q } = req.query;

    // paginación
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
    const skip = (page - 1) * limit;

    const filter = {};
    if (status && STATUS.includes(status)) filter.status = status;

    if (q) {
      const regex = new RegExp(String(q), "i");
      filter.$or = [
        { applicantName: regex },
        { applicantEmail: regex },
        { originInstitution: regex },
        { targetInstitution: regex }
      ];
    }

    const [items, total] = await Promise.all([
      Application.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Application.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      meta: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
}

async function getApplicationById(req, res, next) {
  try {
    const { id } = req.params;
    const app = await Application.findById(id);

    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    return res.status(200).json({ success: true, data: app });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const body = req.validated?.body ?? req.body ?? {};
    const { status } = body;

    if (!STATUS.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${STATUS.join(", ")}`
      });
    }

    const app = await Application.findByIdAndUpdate(id, { status }, { new: true });

    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    return res.status(200).json({ success: true, data: app });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/applications/bulk
 * Body (Opción B):
 * {
 *   "batchId": "historical-2024-backfill-001",
 *   "source": "google-sheets",
 *   "dryRun": true,
 *   "mode": "insert",
 *   "items": [ ... ]
 * }
 */
async function bulkImportApplications(req, res, next) {
  try {
    const { batchId, source, dryRun, mode, items } = req.validated.body;

    const validDocs = [];
    const errors = [];

    items.forEach((rawItem, index) => {
      const parsed = applicationItemSchema.safeParse(rawItem);

      if (!parsed.success) {
        parsed.error.issues.forEach((i) => {
          errors.push({
            index,
            field: i.path.join("."),
            message: i.message
          });
        });
        return;
      }

      // Reglas extra por modo
      if (mode === "upsert" && !parsed.data.externalId) {
        errors.push({
          index,
          field: "externalId",
          message: "externalId is required when mode=upsert"
        });
        return;
      }

      validDocs.push({
        ...parsed.data,
        status: parsed.data.status ?? "DRAFT",
        importBatchId: batchId,
        importSource: source
      });
    });

    // Dry-run: solo valida y reporta, no inserta
    if (dryRun) {
      return res.status(200).json({
        success: true,
        meta: {
          batchId,
          source: source ?? null,
          mode,
          dryRun: true,
          received: items.length,
          valid: validDocs.length,
          invalid: items.length - validDocs.length,
          inserted: 0
        },
        errors
      });
    }

    // Insert implementado
    if (mode === "insert") {
      let insertedCount = 0;

      if (validDocs.length > 0) {
        try {
          const inserted = await Application.insertMany(validDocs, { ordered: false });
          insertedCount = inserted.length;
        } catch (err) {
          // Puede insertar parcial y luego lanzar error (duplicados, etc.)
          errors.push({
            index: null,
            field: null,
            message: err.message
          });
        }
      }

      return res.status(errors.length > 0 ? 207 : 201).json({
        success: true,
        meta: {
          batchId,
          source: source ?? null,
          mode,
          dryRun: false,
          received: items.length,
          inserted: insertedCount,
          failed: items.length - insertedCount
        },
        errors
      });
    }

    // Upsert lo dejamos para el siguiente commit
    return res.status(400).json({
      success: false,
      message: "mode=upsert not implemented yet. Use mode=insert for now."
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createApplication,
  listApplications,
  getApplicationById,
  updateStatus,
  bulkImportApplications
};