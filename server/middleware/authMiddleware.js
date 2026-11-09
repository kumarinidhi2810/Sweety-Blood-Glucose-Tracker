import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check whether token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. Token required."
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Store user information
    req.user = decoded;

    next();

 } catch (error) {
  console.log("JWT Verification Error:", error.message);

  return res.status(403).json({
    message: "Invalid or expired token",
    error: error.message
  });
}
};

export default authenticateToken;