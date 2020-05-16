chrome.runtime.onMessage.addListener(function (msg, sender, response) {

    if (msg.action == "start") {
        getData();
    }

})

function getData() {

    fetch(document.location.href)
        .then(response => response.text())
        .then(pageSource => {


            if ($('td:nth-child(4)').html() === "&nbsp;" || !$('td:nth-child(4)').text().length || pageSource.indexOf('class="recordcount"') > -1) {

                chrome.runtime.sendMessage({
                    from: "content",
                    action: 'check',
                    data: 'yes'
                });
            } else {

                chrome.runtime.sendMessage({
                    from: "content",
                    action: 'check',
                    data: 'no'
                });
            }
        });
}
