/**
 * AuthController
 *
 * @description :: Server-side logic for managing Auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var passport = require('passport');

module.exports = {
    /**
    * Authenticate the user's login.
    *
    * @param req { Object }
    * @param res { Object }
    */
    login: function(req, res) {

        passport.authenticate('local', function(err, user, info) {
            if ((err) || (!user)) {
                return res.json({
                    error: true,
                    message: 'Wrong username or password!'
                });
            }

            req.logIn(user, function(err) {
                if (err) return res.send(err);

                req.session.user = user;

                return res.json({
                    success: true,
                    message: 'User is authenticated'
                });
            });
        })(req, res);
    },

    logout: function(req, res) {
        req.session.destroy(function(err) {
            res.redirect('/');
        });
    }
};
