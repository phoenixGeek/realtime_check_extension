$(document).ready(function () {

    $('#start').on('click', function (event) {

        chrome.runtime.sendMessage({

            from: 'popup',
            action: "start"
        });
    });

    $('#stop').on('click', function (event) {

        chrome.runtime.sendMessage({

            from: 'popup',
            action: "stop"
        });
    });

});

chrome.runtime.onMessage.addListener(function (message) {

    switch (message.action) {

        case "checking":

            let checkeddata = message.checkedData;
            if (checkeddata === "yes") {

                console.log("done")
                document.getElementById("loading").style.display = "none";
                document.getElementById('alertSound').play();
                chrome.browserAction.setBadgeText({ text: '!!' });
                chrome.browserAction.setBadgeBackgroundColor({ color: 'red' });

                setTimeout(() => {

                }, 2000);

            } else {
                chrome.browserAction.setBadgeText({ text: '' });
                document.getElementById("loading").style.display = "block";
            }
            break;
        case "stop":

            document.getElementById("loading").style.display = "none"
            chrome.browserAction.setBadgeText({ text: '' });
    }
});