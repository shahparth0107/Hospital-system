const jwt = require('jsonwebtoken');

function auth() {
  return (req, res, next) => {
    try {
      const hdr = req.headers.authorization || '';
      const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
      if (!token) return res.status(401).json({ message: 'Missing token' });

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload; // { _id, role, name, email }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

module.exports = { auth };
