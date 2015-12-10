/**
 * Created by kunii on 2015/06/01.
 */

var observer = new window.MutationObserver(function (mutations) {
    chrome.storage.sync.get({active: true}, function(result) {
        if (result.active) {
            mutations.forEach(function (mutation) {
                handleMutatedNode(mutation.target);
            });
        }
    });
});

observer.observe(document, {attributes: false, childList: true, characterData: false, subtree: true});

window.onerror = function(message, file, lineNumber) {
    chrome.runtime.sendMessage({method: "error", message: message + ' ,file: ' + file + ':' + lineNumber}, function(response) {});
};

function xhrError(sns, status, url) {
    chrome.runtime.sendMessage({method: "sns_error", message: {
        sns: sns,
        status: status,
        url: url
    }}, function(response) {});
}

/**
 *
 * @param node
 */
function handleMutatedNode(node) {

    var appAttribute = "___buzzranker";
    var searchResultNodes = node.querySelectorAll('.g:not([' + appAttribute + '])');
    
    Array.prototype.slice.call(searchResultNodes).forEach(function (searchResultNode){

        if (searchResultNode.querySelectorAll('.g').length) {
            return false;
        }

        searchResultNode.setAttribute(appAttribute, "1");

        var linkNode = searchResultNode.querySelector('.r a');
        var targetNode = searchResultNode.querySelector('.s .f');

        if (linkNode && targetNode) {
            renderSNSView(linkNode.href, targetNode);
        }
    });
}

/**
 *
 * @param url
 * @param targetNode
 */
function renderSNSView(url, targetNode) {

    var facebook = createCounterElement('f', 'rgba(59,89,152,0.9)');
    targetNode.appendChild(facebook);

    var twitter = createCounterElement('t', 'rgba(85,172,238,0.9)');
    targetNode.appendChild(twitter);

    var hatena = createCounterElement('B!', 'rgba(0,143,222,0.9)');
    targetNode.appendChild(hatena);

    getFacebookCounter(url, function (counter) {
        facebook.setCounter(counter);
    });

    getTwitterCounter(url, function (counter) {
        twitter.setCounter(counter);
    });

    getHatenaCounter(url, function (counter) {
        hatena.setCounter(counter);
    });
}

/**
 *
 * @param counter
 * @param color
 * @returns {HTMLElement}
 */
function createCounterElement(label, color) {

    var newItem = document.createElement("span");

    newItem.style.background = color + " none repeat scroll 0 0";
    newItem.style.color = "#FFFFFF";
    newItem.style.fontWeight = "bold";
    newItem.style.fontSize = "12px";
    newItem.style.padding = "1px 5px";
    newItem.style.marginLeft = "5px";
    newItem.style.textDecoration = "none";
    newItem.textContent = label + ' 0';

    newItem.setCounter = function (counter) {
        newItem.textContent = label + ' ' + counter;
    };

    return newItem;
}

/**
 * facebook count
 * @param url
 * @param callback
 */
function getFacebookCounter(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "https://graph.facebook.com/?id=" + encodeURIComponent(url), true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 0) {
                return callback.call(this, 0);
            } else if (xhr.status == 200) {
                var counter = JSON.parse(xhr.responseText).shares || 0;
                return callback.call(this, counter);
            } else {
                xhrError('Facebook', xhr.status, url);
            }
        }
    };
    xhr.onerror = function (e) {
        xhrError('Facebook', xhr.status, url);
    };
    xhr.send(null);
}

/**
 * twitter count
 * @param url
 * @param callback
 */
function getTwitterCounter(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "https://urls.api.twitter.com/1/urls/count.json?url=" + encodeURIComponent(url), true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 0) {
                return callback.call(this, 0);
            } else if (xhr.status == 200) {
                var counter = JSON.parse(xhr.responseText).count || 0;
                return callback.call(this, counter);
            } else {
                xhrError('Twitter', xhr.status, url);
            }
        }
    };
    xhr.onerror = function (e) {
        xhrError('Twitter', xhr.status, url);
    };
    xhr.send(null);
}

/**
 * hatena count
 * @param url
 * @param callback
 */
function getHatenaCounter(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "https://b.hatena.ne.jp/entry.count?url=" + encodeURIComponent(url), true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 0) {
                return callback.call(this, 0);
            } else if (xhr.status == 200) {
                var counter = ~~xhr.responseText;
                return callback.call(this, counter);
            } else {
                xhrError('Hatena', xhr.status, url);
            }
        }
    };
    xhr.onerror = function (e) {
        xhrError('Hatena', xhr.status, url);
    };
    xhr.send(null);
}
