async function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.status(401).send("not authenticated");
}

module.exports = {
    isAuthenticated
}