/**
 * SnippetController
 *
 * @description :: Server-side logic for managing Snippets
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /**
     * Gets all snippets created by the logged in user.
     *
     * @param {object} req
     * @param {object} res
     */
    get: function(req, res) {
        var user =  req.session.user,
            userId;

        if (!!user) {
            userId = user.id;
        }

        Snippets.find({
            userId: userId
        }).exec(function(err, snippets) {
            if (err) {
                return res.notFound(err);
            }

            return res.json(snippets);
        });
    },

    /**
     * Creates a new snippet.
     *
     * @param {object} req
     * @param {object} res
     */
    create: function(req, res) {
        var newSnippet = req.allParams();

        Snippets.create(newSnippet).exec(function(err, createdSnippet) {
            if (err) {
                return res.negotiate(err);
            }

            return res.json(createdSnippet);
        });
    },

    /**
     * Update a snippet by making it starred or not starred.
     *
     * @param {object} req
     * @param {object} res
     */
    star: function(req, res) {
        var snippet = req.allParams();

        if (!(snippet.id && snippet.isStarred)) {
            return res.badRequest('Update attempt failed, invalid data.');
        }

        Snippets.update({id: snippet.id}, {isStarred: snippet.isStarred}).exec(function(err, updated) {

            if (err) {
                console.log('in err: ', err);
                return res.negotiate(err);
            }

            return res.json({
                notice: 'Updated the snippet!'
            });
        });
    },

    /**
     * Delete a snippet.
     *
     * @param {object} req
     * @param {object} res
     */
    delete: function(req, res) {
        Snippets.destroy({id: req.param('id')}).exec(function(err, deleted) {
            if (err) {
                return res.negotiate(err);
            }

            return res.ok();
        });
    }
};
