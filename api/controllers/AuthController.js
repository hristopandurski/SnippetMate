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
                return res.send({
                    message: info.message,
                    user: user
                });
            }

            req.logIn(user, function(err) {
                if (err) return res.send(err);

                console.log('in AuthController req.login ' + user.username);

                req.session.user = user;

                return res.json({
                    username: user.username
                });
            });
        })(req, res);
    },

    logout: function(req, res) {
        req.logout();
        res.redirect('/');
    }
};
