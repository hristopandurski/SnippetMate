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
     * Gets a specific snippet created by the logged in user.
     *
     * @param {object} req
     * @param {object} res
     */
    getOne: function(req, res) {
        var params =  req.allParams();;

        Snippets.find({
            id: params.id
        }).exec(function(err, snippet) {
            if (err) {
                return res.notFound(err);
            }

            return res.json(snippet);
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
                return res.negotiate(err);
            }

            return res.json({
                notice: 'Updated the snippet!'
            });
        });
    },

    /**
     * Editing a snippet.
     *
     * @param {object} req
     * @param {object} res
     */
    edit: function(req, res) {
        var params = req.allParams();

        if (!(params.id && params.isStarred)) {
            return res.badRequest('Update attempt failed, invalid data.');
        }

        Snippets
            .findOne({
                id: params.id
            })
            .populateAll()
            .exec(function(err, snippet) {
                if (err) return res.notFound();

                if (!snippet) {
                    return res.ok({
                        error: true,
                        errorMessage: 'Snippet with id ' + params.id + ' does not exist in the database.'
                    });
                }

                if (req.user && (snippet.userId !== req.user.id)) {
                    return res.forbidden({
                        notice: 'Only the creator of the snippet is able to update it.'
                    });
                }

                Snippets.update(params.id, params).exec(function(err, updated) {
                    if (!err && updated.length) {
                        Snippets
                            .findOne({
                                id: params.id
                            })
                            .populateAll()
                            .exec(function(err, updatedSnippet) {
                                if (err) return res.notFound();

                                return res.json({
                                    notice: 'Updated the snippet!'
                                });
                            });
                    } else {
                        return res.badRequest(err);
                    }
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
