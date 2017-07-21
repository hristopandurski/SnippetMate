/**
 * Snippet.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        userId: {
            type: 'integer'
        },
        title: {
            type: 'string'
        },
        description: {
            type: 'text'
        },
        language: {
            type: 'string'
        },
        code: {
            type: 'longtext'
        },
        labels: {
            type: 'array'
        },
        isStarred: {
            type: 'boolean'
        }
    }
};
