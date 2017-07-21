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

        // Hash password
        Passwords.encryptPassword({
            password: req.param('password')
        }).exec({

            error: function(err) {
                return res.serverError(err);
            },

            success: function(result) {

                var options = {
                    username: req.param('username'),
                    password: result
                };

                Users.create(options).exec(function(err, createdUser) {
                    if (err) {
                        console.log('the error is: ', err.invalidAttributes);

                        // Check for duplicate username
                        if (err.invalidAttributes && err.invalidAttributes.username && err.invalidAttributes.username[0] &&
                            err.invalidAttributes.username[0].rule === 'unique') {

                            // return res.send(409, 'Username is already taken by another user, please try again.');
                            return res.alreadyInUse(err);
                        }

                        return res.negotiate(err);
                    }

                    return res.json({
                        username: createdUser.username
                    });
                });
            }
        });
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
                return res.ok({
                    error: true,
                    errorMessage: 'User with username ' + params.username + ' does not exist in the database'
                });
            }

            res.json(user);
        });
    },

    /**
    * Find a user by id.
    *
    * @param { Object }
    * @param { Object }
     */
    showById: function(req, res) {
        console.log(req.user);
        Users.findOne({
            id: req.user
        }).exec(function(err, user) {
            console.log('in showById' + user);
            if (!user) {
                return res.ok({
                    error: true,
                    errorMessage: 'User with id ' + req.user + ' does not exist in the database'
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
        User.find(function(err, users) {
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

        User.update({
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
