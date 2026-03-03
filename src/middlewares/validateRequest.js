function validateRequest(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: result.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message
        }))
      });
    }

    req.validated = result.data;
    next();
  };
}

module.exports = { validateRequest };