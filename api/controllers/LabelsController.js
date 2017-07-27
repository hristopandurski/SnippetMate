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
        var user =  req.session.user,
            userId;

        if (!!user) {
            userId = user.id;
            console.log('in labels controller - userId', userId);
        }

        Labels.find({
            userId: userId
        }).exec(function(err, labels) {
            if (err) {
                return res.notFound(err);
            }

            console.log('labels: ', labels);

            return res.json(labels);
        });
    }
};
