const authorizeRoles = (roles) => {
  return (req, res, next) => {
    const userType = req.headers["x-auth-user-type"];
    if (!userType || !roles.includes(userType)) {
      return res.status(403).json({ message: "Access denied!" });

    }
    next()
  };
};

export default authorizeRoles