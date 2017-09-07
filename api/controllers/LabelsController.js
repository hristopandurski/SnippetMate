/**
 * LabelController
 *
 * @description :: Server-side logic for managing Labels
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /**
     * Get all labels created by the logged in user.
     *
     * @param { Object } req
     * @param { Object } res
     */
    get: function(req, res) {
        var user =  req.session.user,
            userId;

        if (!!user) {
            userId = user.id;
        }

        Labels.find({
            userId: userId
        }).exec(function(err, labels) {
            if (err) {
                return res.notFound(err);
            }

            return res.json(labels);
        });
    },

    /**
     * Creates a new label.
     *
     * @param {object} req
     * @param {object} res
     */
    create: function(req, res) {
        var params = req.allParams();

        Labels.create(params).exec(function(err, createdLabel) {
            if (err) {
                return res.negotiate(err);
            }

            return res.json(createdLabel);
        });
    }
};
