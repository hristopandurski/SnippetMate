(function() {
    'use strict';

    angular.module('app.directives.editor-value', []).directive('editorValue', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var snippet = ace.edit(element[0]);

                snippet.setTheme('ace/theme/textmate');
                snippet.setReadOnly(true);
                snippet.setValue(attrs.editorValue, -1);
            }
        };
    });
})();
