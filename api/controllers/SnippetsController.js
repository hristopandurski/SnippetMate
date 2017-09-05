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
            console.log('in snippets controller - userId', userId);
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

        console.log('in snippets create:', newSnippet.description);

        Snippets.create(newSnippet).exec(function(err, createdSnippet) {
            console.log('in snippets create exec: ', createdSnippet.id);

            if (err) {
                return res.negotiate(err);
            }

            console.log('in usercontroller3: ', createdSnippet.username);
            return res.json(createdSnippet);
        });
    }
};
