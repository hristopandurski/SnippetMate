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
        var user =  req.session.user;

        if (!user) {
            return res.json({error: 'User is not logged in.'});
        }

        Labels.find({
            userId: user.id
        }).exec(function(err, labels) {
            if (err) {
                return res.notFound(err);
            }

            if (!labels) {
                return res.json([]);
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
