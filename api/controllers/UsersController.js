/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Passwords = require('machinepack-passwords');

module.exports = {
    /**
    * Create a user record in the data base.
    *
    * The Passwords.encryptPassword() machine takes a string as input and transforms it
    * into an encrypted password using the BCrypt algorithm.
    *
    * @param { Object } req
    * @param { Object } res
     */
    create: function(req, res, next) {

        Users.create(req.allParams()).exec(function(err, createdUser) {
            if (err) {

                // Check for duplicate username
                if (err.invalidAttributes && err.invalidAttributes.username && err.invalidAttributes.username[0] &&
                    err.invalidAttributes.username[0].rule === 'unique') {

                    return res.send(409, 'Username is already taken by another user, please try again.');
                }

                return res.negotiate(err);
            }

            return res.json({
                username: createdUser.username
            });
        });
    },

    isAuthenticated: function(req, res, next) {
        if (req.user) {
            next();
        } else {
            return res.json({
                error: true,
                reason: 'User is not authenticated.'
            });
        }
    },

    /**
    * Find a user by username.
    *
    * @param { Object } req
    * @param { Object } res
     */
    show: function(req, res) {
        var params = req.allParams();

        Users.findOne({
            username: params.username
        }).exec(function(err, user) {
            if (!user) {
                return res.json({
                    error: true,
                    errorMessage: 'User with username ' + params.username + ' does not exist in the database'
                });
            }

            res.json(user);
        });
    },

    /**
    * Return current user's id..
    *
    * @param { Object }
    * @param { Object }
    * @return { Object }
     */
    showById: function(req, res) {
        var user = req.session.user,
            params = req.allParams();

        if (!!user) {
            params.id = user.id;
        }

        Users.findOne({
            id: params.id
        })
        .exec(function(err, user) {
            if (err) return res.negotiate(err);

            if (!user) {

                return res.json({
                    error: true,
                    errorMessage: 'User is not logged in.'
                });
            }

            res.json(user);
        });
    },

    /**
    * Return all users.
    *
    * @param { Object }
    * @param { Object }
     */
    showAll: function(req, res) {
        Users.find(function(err, users) {
            if (err) return next(err);

            return res.json(users);
        });
    },

    /**
    * Perform a soft delete.
    *
    * @param { Object }
    * @param { Object }
     */
    remove: function(req, res) {
        if (!req.param('id')) {
            return res.badRequest('id is a required parameter.');
        }

        Users.update({
            id: req.param('id')
        },
        {
            deleted: true
        },
        function(err, removedUser) {
            if (err) return res.negotiate(err);

            if (removedUser.length === 0) {
                return res.notFound();
            }

            return res.ok();
        });
    }
};
