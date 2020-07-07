var WildRydes = window.WildRydes || {};
WildRydes.map = WildRydes.map || {};

var authToken = false;
WildRydes.authToken.then(function setAuthToken(token) {
    if (token) {
        authToken = token;
    } else {
        window.location.href = 'index.html';
    }
}).catch(function handleTokenError(error) {
    alert(error);
    window.location.href = 'index.html';
});

const el = (type, attributes = {}, contents = false) => {
    const main = document.createElement(type);
    Object.keys(attributes).forEach(key => {
        main.setAttribute(key, attributes[key])
    })
    if (contents && typeof contents === 'string') {
        main.innerHTML = contents
    } else if (contents) {
        contents.forEach(content => main.appendChild(content));
    }
    return main;
}

const loadHistory = () => {
    if (authToken) {
        $.ajax({
            type: "GET",
            url: _config.api.invokeUrl + "/scantable",
            crossdomain: true,
            contentType: 'application/json',
            dataType: 'json',
            headers: {
                Authorization: authToken
            },
            data: {
                tableName: 'UploadVideo'
            },
            success: function (data, textStatus, jqXHR) {
                setVideoHistory(data.result.Items);
                showHistory();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                setError('POST: Could not update video data. Please check console/network logs.')
            }
        });
    } else {
        setError('GET: Cannot get form data. Please check console/network logs.')
    }
}

window.onload = event => {
    loadHistory();
    $('#signOut').click(function () {
        WildRydes.signOut();
        alert("You have been signed out.");
        window.location = "index.html";
    });
}

const setVideoHistory = (items) => {
    const list = $('#videoHistoryList')[0];
    list.innerHTML = '';
    items.forEach(item => {
        const { videoDescription, youtubeID, bookName, section, videoTitle, uploadID } = item;
        list.appendChild(createVideoHistoryItem(videoDescription, youtubeID, bookName, section, videoTitle, uploadID));
    })
}

const showHistory = () => {
    const history = $('#historyContainer')[0];
    history.removeAttribute('hidden');
    const historyLoader = $('#historyLoader')[0];
    historyLoader.setAttribute('hidden', true);
}

const createMetaData = (metaData) => {
    const chips = Object.keys(metaData).map(chip => {
        const b = el('b', {}, chip + ': ');
        return el('p', {}, [b, document.createTextNode(metaData[chip])]);
    })
    const div = el('div', {
        class: 'd-lg-inline-flex video-meta'
    }, chips);
    return div;
}
const getTimeStamp = (uploadID) => {
    if (uploadID) {
        let temp = uploadID.split('.');
        if (temp && temp.length) {
            temp = temp[0];
            temp = temp.split('_');
            if (temp && temp.length) {
                const UTCStr = temp.pop();
                if (UTCStr) {
                    var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
                    d.setUTCMilliseconds(UTCStr);
                    return d.toString();
                }
            }
        }
    }
    return 'Unavailable';
};

const createHeader = (videoTitle, uploadID) => {
    const h5 = el('h5', {
        class: 'mb-1'
    }, [el('b', {}, 'Title:'), document.createTextNode(videoTitle)]);
    const small = el('small', {
        class: 'text-muted'
    }, 'Uploaded on:' + getTimeStamp(uploadID))
    const div = el('div', {
        class: 'd-flex w-100 justify-content-between'
    }, [h5, small])
    return div;
}

const createVideoHistoryItem = (videoDescription, youtubeID, bookName, section, videoTitle, uploadID) => {
    const youtube = mediaLink('https://www.youtube.com/watch?v=', youtubeID, 'youtube.com/watch?v=', 'YouTube');
    const edX = mediaLink('https://www.youtube.com/watch?v=', youtubeID, 'youtube.com/watch?v=', 'EdX');
    const mediaCol1 = el('small', {
        class: 'col-sm-6',
        style: 'float: left;'
    }, [youtube])
    const mediaCol2 = el('small', {
        class: 'col-sm-6',
        style: 'float: left;'
    }, [edX]);
    const rowMedia = el('div', {
        class: 'row'
    }, [mediaCol1, mediaCol2]);
    const br = el('br');
    const description = el('p', {
        class: 'mb-1'
    }, videoDescription);
    const metaData = createMetaData({
        'Book Name': bookName,
        'Section': section
    });
    const header = createHeader(videoTitle, uploadID);
    return el('div', {
        class: 'video-history-item'
    }, [header, br, metaData, description, br, rowMedia]);
}

function mediaLink(linkBase, mediaId, linkLabelPrefix, mediaTitle) {
    const copyButton = el('button', {
        type: 'button',
        class: 'btn btn-outline-secondary copy-url'
    }, 'copy url');
    const link = el('a', {
        href: linkBase + mediaId,
        target: '_blank'
    }, linkLabelPrefix + mediaId);
    const br = el('br');
    const status = el('span', {
        class: 'video-status badge badge-' + (mediaId ? 'success' : 'warning')
    }, mediaId ? 'live' : 'pending');
    const title = el('b', {}, mediaTitle);
    let wrappedEls = [
        title, status, br
    ];
    mediaId && wrappedEls.push(link);
    const wrapper = el('p', {}, wrappedEls);
    const container = el('div', {
        
    }, [wrapper]);
    return container;
}
