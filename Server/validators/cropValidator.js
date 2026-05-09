import { body, validationResult } from "express-validator"

export const cropValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("pricePerUnit").isNumeric().withMessage("Price must be number"),
  body("stock").isInt({ min: 1 }).withMessage("Stock must be > 0"),
]

export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}