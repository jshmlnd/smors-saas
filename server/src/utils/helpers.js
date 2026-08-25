export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

export const httpError = (status, message) => {
  const err = new Error(message)
  err.status = status
  return err
}
