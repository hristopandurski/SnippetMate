/**
 * SnippetController
 *
 * @description :: Server-side logic for managing Snippets
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    /**
     * Get all snippets created by the logged in user.
     *
     * @param { Object }
     * @param { Object }
     */
    getSnippets: function(req, res) {
        var userId = req.session.userId;

        Snippets.find({
            userId: userId
        }).exec(function(err, snippets) {
            if (err) {
                return res.notFound(err);
            }

            res.json(snippets);
        });
    }
};
