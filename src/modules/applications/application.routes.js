const router = require("express").Router();
const ctrl = require("./application.controller");
const { validateRequest } = require("../../middlewares/validateRequest");
const { createApplicationSchema, updateStatusSchema } = require("./application.validation");

router.post("/applications", validateRequest(createApplicationSchema), ctrl.createApplication);
router.get("/applications", ctrl.listApplications);
router.get("/applications/:id", ctrl.getApplicationById);
router.patch("/applications/:id/status", validateRequest(updateStatusSchema), ctrl.updateStatus);

module.exports = router;