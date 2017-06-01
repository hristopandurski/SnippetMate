(function() {
    'use strict';

    angular.module('app.components.snippet').filter('dateRange', function() {
        return function(date) {
            var fromDate = new Date(Date.parse(date)),
                toDate = new Date(),
                dayDifference = Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)),
                hrsDifference = Math.floor((toDate - fromDate) / (1000 * 60 * 60)),
                minDifference = Math.floor((toDate - fromDate) / (1000 * 60)),
                diff = 0;

            // calculate whats the difference between the snippet's creation and now
            if (dayDifference <= 0) {
                if (hrsDifference <= 0) {
                    if (minDifference <= 0) {
                        diff = ' just now';
                    } else {
                        if (minDifference === 1) {
                            diff = minDifference + ' minute ago';
                        } else {
                            diff = minDifference + ' minutes ago';
                        }
                    }
                } else {
                    if (hrsDifference === 1) {
                        diff = hrsDifference + ' hour ago';
                    } else {
                        diff = hrsDifference + ' hours ago';
                    }
                }
            } else {
                if (dayDifference === 1) {
                    diff = dayDifference + ' day ago';
                } else {
                    diff = dayDifference + ' days ago';
                }
            }

            return diff;
        };
    });
}());
