function validateRequest(req, res, next) {
  const errors = req.validationErrors || [];
  if (errors.length) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }
  next();
}

module.exports = validateRequest;