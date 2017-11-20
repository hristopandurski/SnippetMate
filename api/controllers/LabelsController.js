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
     * Gets a specific label created by the logged in user.
     *
     * @param {object} req
     * @param {object} res
     */
    getOne: function(req, res) {
        var params =  req.allParams();;

        Labels.findOne({
            id: params.id
        }).exec(function(err, label) {
            if (err) {
                return res.notFound(err);
            }

            return res.json(label);
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
    },

    /**
     * Editing a label.
     *
     * @param {object} req
     * @param {object} res
     */
    edit: function(req, res) {
        var params = req.allParams();

        if (!(params.id)) {
            return res.badRequest('Update attempt failed, invalid data.');
        }

        Labels
            .findOne({
                id: params.id
            })
            .populateAll()
            .exec(function(err, label) {
                if (err) return res.notFound();

                if (!label) {
                    return res.ok({
                        error: true,
                        errorMessage: 'Snippet with id ' + params.id + ' does not exist in the database.'
                    });
                }

                if (req.user && (label.userId !== req.user.id)) {
                    return res.forbidden({
                        notice: 'Only the creator of the snippet is able to update it.'
                    });
                }

                Labels.update(params.id, params).exec(function(err, updated) {
                    if (!err && updated.length) {
                        console.log('ending the update', updated.id);

                        Labels
                            .findOne({
                                id: params.id
                            })
                            .populateAll()
                            .exec(function(err, updatedLabel) {
                                if (err) return res.notFound();

                                return res.json({
                                    notice: 'Updated the label!'
                                });
                            });
                    } else {
                        return res.badRequest(err);
                    }
                });
            });
    }
};
