/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

module.exports = function(req, res, next) {

    if (req.isAuthenticated()) {
        console.log('sessionAuth if:');
        return next();
    } else {
        console.log('sessionAuth else:');
        return res.status(403).json({error: 'You are not permitted to perform this action.'});

    }
};
