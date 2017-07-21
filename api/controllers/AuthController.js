/**
 * AuthController
 *
 * @description :: Server-side logic for managing Auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Passwords = require('machinepack-passwords');

module.exports = {
    /**
    * Authenticate the user's login.
    *
    * @param req { Object }
    * @param res { Object }
    */
    login: function(req, res) {
        console.log('authc username' + req.param('username'));

        Users.findOne({username: req.param('username')}, function foundUser(err, createdUser) {
            if (err) return res.negotiate(err);

            if (!createdUser) return res.notFound();

            Passwords.checkPassword({
                passwordAttempt: req.param('password'),
                encryptedPassword: createdUser.password
            }).exec({

                error: function(err) {
                    return res.negotiate(err);
                },

                incorrect: function() {
                    return res.notFound();
                },

                success: function() {

                    req.session.userId = createdUser.id;

                    return res.ok();
                }
            });
        });
    },

    logout: function(req, res) {

        // log the user-agent out.
        req.session.userId = null;

        return res.ok();
    }
};
