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
     * @param { Object }
     * @param { Object }
     */
    getLabels: function(req, res) {
        var userId =  req.session.userId;

        Labels.find({
            userId: userId
        }).exec(function(err, labels) {
            if (err) {
                return res.notFound(err);
            }

            res.json(labels);
        });
    }
};
