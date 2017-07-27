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
    }
};
