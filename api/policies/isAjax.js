module.exports = function(req, res, next) {
    if (!req.xhr) {
        return res.view('/client/index');
    }

    return next();
};
