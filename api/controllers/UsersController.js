/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /*
    * Create a user record in the data base
    * @param req - object
    * @param - res - object
     */
    create: function(req, res, next) {
        Users.create(req.allParams(), function userCreated(err, user) {
            if (err) return next(err);

            res.ok(user.data);
        });
    },

    /*
    * Find a user by username
    * @param req - object
    * @param - res - object
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

    /*
    * Find a user by id
    * @param req - object
    * @param - res - object
     */
    showById: function(req, res) {
        var params = req.allParams();

        User.findOne({
            id: params.id
        }).exec(function(err, user) {
            if (!user) {
                return res.ok({
                    error: true,
                    errorMessage: 'User with id ' + params.id + ' does not exist in the database'
                });
            }

            res.json(user);
        });
    },

    showAll: function(req, res) {
        User.find(function(err, users) {
            if (err) return next(err);

            return res.json(users);
        });
    }
};
