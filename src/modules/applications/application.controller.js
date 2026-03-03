const Application = require("./application.model");
const { STATUS } = require("./application.model");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
}

async function createApplication(req, res, next) {
  try {
    const body = req.validated?.body ?? req.body ?? {}; //  evita destructuring sobre undefined

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

    // Validación mínima (luego lo pasamos a Zod/Joi)
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

    const app = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    return res.status(200).json({ success: true, data: app });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createApplication,
  listApplications,
  getApplicationById,
  updateStatus
};