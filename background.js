var cr = {};
cr.reloadingTabs = {};
cr.doLogging = true;
var intervalFunc;

chrome.runtime.onMessage.addListener(function (request, response, sendResponse) {

    if (request.action === "start") {

        $(document).ready(function () {

            chrome.tabs.getSelected(window.id, function (tab) {

                var cr = chrome.extension.getBackgroundPage().cr;

                var props = {
                    tab: tab,
                    timeout: 5,
                    countdown: 5
                };

                props = cr.registerTabReload(props);

            });
        });

        intervalFunc = setInterval(() => {

            chrome.tabs.query({ active: true }, function (tabs) {

                let tabId = tabs[0].id;
                chrome.tabs.sendMessage(tabId, {
                    from: "background",
                    action: 'start',
                });

            });
        }, 1500);

    }

    if (request.action === "stop") {

        chrome.runtime.sendMessage({
            from: "background",
            action: 'stop',
        });

        $(document).ready(function () {

            chrome.tabs.getSelected(window.id, function (tab) {
                var cr = chrome.extension.getBackgroundPage().cr;
                var props = cr.unregisterTabReload(tab);

            });
            window.close();
        });

    }

    if (request.action === 'check') {

        let checkedData = request.data;
        if (checkedData === "yes") {

            clearInterval(intervalFunc);

            $(document).ready(function () {

                chrome.tabs.getSelected(window.id, function (tab) {
                    var cr = chrome.extension.getBackgroundPage().cr;
                    var props = cr.unregisterTabReload(tab);

                });
                window.close();
            });
        }

        chrome.runtime.sendMessage({
            from: "background",
            action: 'checking',
            checkedData: checkedData
        });

    }

});


cr.isRegistered = function (tabId) {
    return cr.reloadingTabs[tabId] !== undefined;
}

cr.registerTabReload = function (props) {
    cr.unregisterTabReload(props.tab);
    if (props.timeout < 1) return;

    props.nextUpdate = new Date().getTime() + (props.timeout * 1000);
    props.intervalID = setInterval('cr.reloadTab(' + props.tab.id + ')', props.timeout * 1000);
    cr.reloadingTabs[props.tab.id] = props;
    cr.updateIcon(props.tab.id);

    if (props.countdown && !cr.countdownIntervalID) {
        cr.countdownIntervalID = setInterval('cr.updateCountdown()', 1000);
    }

    if (props.countdown) cr.updateCountdown(true);

    return props;
}

cr.unregisterTabReload = function (tab) {
    var props = cr.reloadingTabs[tab.id];
    if (props) {
        clearInterval(props.intervalID);
        delete cr.reloadingTabs[tab.id];
    }
    cr.updateIcon(tab.id);

    return props;
}

cr.updateIcon = function (tabId) {
    if (cr.isRegistered(tabId)) {
        chrome.browserAction.setIcon({ path: "refresh-on.png", tabId: tabId });
    }
    else {
        chrome.browserAction.setIcon({ path: "refresh-off.png", tabId: tabId });
    }
}

cr.reloadTab = function (tabId) {
    var props = cr.reloadingTabs[tabId];

    if (!props || !props.tab) {
        return;
    }

    // reload page
    chrome.tabs.update(tabId, { url: props.tab.url });

    props.nextUpdate = new Date().getTime() + (props.timeout * 1000);

    if (props.countdown) cr.updateCountdown(true);

    console.log('reloaded win:' + props.tab.windowId + ' tab:' + tabId);
}

cr.loadAllAutos = function () {
    var autosJson = localStorage['autos'];
    if (autosJson) {
        return JSON.parse(autosJson);
    }
}

cr.loadAutos = function (url) {
    var autos = cr.loadAllAutos();
    if (autos) {
        var props = autos[url];

        if (props) console.log('found auto for ' + url);

        return props;
    }
}

cr.saveAutos = function (props) {
    var autos = cr.loadAllAutos();

    if (!autos) {
        autos = {};
    }

    autos[props.tab.url] = {
        url: props.tab.url,
        timeout: props.timeout,
        stick: props.stick,
        title: props.tab.title,
        countdown: props.countdown
    };

    autosJson = JSON.stringify(autos);

    localStorage['autos'] = autosJson;
}

cr.removeAutos = function (url) {
    var autos = cr.loadAllAutos();

    if (autos) {
        delete autos[url];

        autosJson = JSON.stringify(autos);
        localStorage['autos'] = autosJson;
    }
}

cr.log = function (msg) {
    if (cr.doLogging) {
        var d = new Date();
        console.log(d.getHours() +
            ':' + d.getMinutes() +
            ':' + d.getSeconds() +
            ' ' + msg);
    }
}

cr.extractDomain = function (url) {
    var pattern = /^([a-zA-Z]+:\/\/[a-zA-Z0-9\.]+)/;
    var result = pattern.exec(url);
    if (result) {
        return result[1];
    }
}

cr.updateCountdown = function (force) {
    var key;
    for (key in cr.reloadingTabs) {
        if (typeof cr.reloadingTabs[key] !== 'function') {
            var tabId = parseInt(key);

            var props = cr.reloadingTabs[tabId];
            if (!props.countdown) {
                continue;
            }

            var millis = props.nextUpdate - new Date().getTime();
            var seconds = 0;

            if (millis > 0) {
                seconds = millis / 1000;
                seconds = seconds.toFixed();
            }


        }
    }
}