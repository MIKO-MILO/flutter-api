const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  try {
    const bearer = token.split(" ")[1];

    const decoded = jwt.verify(
      bearer,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({
      message: "Invalid Token"
    });
  }
};