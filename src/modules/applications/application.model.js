const mongoose = require("mongoose");

const STATUS = ["DRAFT", "SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED"];

const applicationSchema = new mongoose.Schema(
  {
    applicantName: { type: String, required: true, trim: true, maxlength: 120 },
    applicantEmail: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },

    originInstitution: { type: String, required: true, trim: true, maxlength: 200 },
    targetInstitution: { type: String, required: true, trim: true, maxlength: 200 },

    originProgram: { type: String, required: false, trim: true, maxlength: 200 },
    targetProgram: { type: String, required: false, trim: true, maxlength: 200 },

    year: { type: Number, required: false, min: 2000, max: 2100 },
    requestedSemester: { type: Number, required: false, min: 1, max: 2 },

    status: { type: String, enum: STATUS, default: "DRAFT", index: true },

    notes: { type: String, required: false, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
module.exports.STATUS = STATUS;