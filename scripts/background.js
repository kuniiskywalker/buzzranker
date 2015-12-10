/**
 * Created by kunii on 2015/06/01.
 */

var _gaq = _gaq || [];

function init() {

    // google analytics
    // var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';

    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);

    _gaq.push(['_setAccount', '']);
    _gaq.push(['_trackPageview']);
    
    // initial badge text
    chrome.storage.sync.get({active:true}, function(result) {
        changeBadgeText(result.active);
    });

    // click event of toolbar icon
    chrome.browserAction.onClicked.addListener(function(tab) {
        chrome.storage.sync.get({active: true}, function(result) {
            var changedActive = (result.active)? false: true;
            chrome.storage.sync.set({active: changedActive});
            changeBadgeText(changedActive);
        });
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.method) {
        case("error"):

            _gaq.push([
                '_trackEvent',
                'error',
                request.message,
                navigator.userAgent + ''
            ]);

            break;
        case("sns_error"):

            _gaq.push([
                '_trackEvent',
                'sns_error',
                request.message.sns,
                request.message.status,
                request.message.url,
                navigator.userAgent + ''
            ]);

            break;
    }
});

// change toolbar icon badge text
var changeBadgeText = function (valid) {

    var icon;

    if (valid) {
        icon = {
            "19": "images/on.png",
            "38": "images/on.png"
        };
    } else {
        icon = {
            "19": "images/off.png",
            "38": "images/off.png"
        };
    }

    chrome.browserAction.setIcon({ path: icon});
};

document.addEventListener('DOMContentLoaded', function () {
    init();
});
