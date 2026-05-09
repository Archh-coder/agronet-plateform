import jwt from 'jsonwebtoken'

const protect = (req, res, next) => {
  // get token from cookie
  const token = req.cookies?.token
  console.log("TOKEN:", token)
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" })
  }
  try {

    // verify token and attach user to request
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded   // now every route can access req.user._id and req.user.role

    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token. Please login again.' })
  }
  console.log("COOKIES:", req.cookies)
}


export default protect