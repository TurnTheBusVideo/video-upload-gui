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
                if(Array.isArray(data.result.Items)){
                    setVideoHistory(data.result.Items);
                    showHistory();
                } else {
                    showHistoryError();
                    setError('GET: Empty history data. Please check console/network logs.')
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                setError('GET: Cannot get history data. Please check console/network logs.')
            }
        });
    } else {
        setError('GET: Cannot get history data. Please check console/network logs.')
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


const youtubeTitle = (item) => {
    const {
        chapterPart,
        chapterNumber,
        videoTitle,
        chapterName,
        bookName,
        classN
    } = item;

    return chapterPart + ' CH ' + chapterNumber + ' ' + 
    videoTitle + ' ' + chapterName + ' ' + bookName + ' ' + classN;
}

const validDate = (d) => {
    if (Object.prototype.toString.call(d) === "[object Date]") {
        if (isNaN(d.getTime())) {
          return false
        } else {
          return true
        }
      } else {
        return false
      }
}

const setVideoHistory = (items) => {
    const list = $('#videoHistoryList')[0];
    list.innerHTML = '';

    const dateCompare = (item1, item2) => {
        const date1 = item1.uploadedOn;
        const date2 = item2.uploadedOn;
        if(!validDate(date1)) return 1;
        if(!validDate(date2)) return -1;
        if (date1 > date2) {
            return -1;
          }
        if (date1 < date2) {
        return 1;
        }
        return 0;
    };

    items.forEach(item => {
        item.uploadedOn = getTimeStamp(item.uploadID);
        item.youtubeTitle = youtubeTitle(item);
    })

    items.sort(dateCompare).forEach(item => {
        list.appendChild(
            createVideoHistoryItem(item)
        );
    })
}

const showHistoryError = () => {
    const historyError = $('#videoHistoryError')[0];
    historyError.removeAttribute('hidden');
    const historyLoader = $('#historyLoader')[0];
    historyLoader.setAttribute('hidden', true);
}

const showHistory = () => {
    const history = $('#historyContainer')[0];
    history.removeAttribute('hidden');
    const historyLoader = $('#historyLoader')[0];
    historyLoader.setAttribute('hidden', true);
}

const createMetaData = (metaData) => {
    const chips = Object.keys(metaData).filter(
        metaDataKey => metaData[metaDataKey] && metaData[metaDataKey] !== 'NULL'
    ).map(metaDataKey => {
        const b = el('b', {}, metaDataKey + ': ');
        return el('div', {
            class: 'col-sm-12'
        }, [b, document.createTextNode(metaData[metaDataKey])]);
    })
    const div = el('div', {
        class: 'row'
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
                    return d;
                }
            }
        }
    }
    return 'Unavailable';
};

const createHeader = (videoTitle, uploadedOn) => {
    const h5 = el('h5', {
        class: 'col-sm-12'
    }, [el('b', {}, 'Title: '), document.createTextNode(videoTitle)]);
    const small = el('h6', {
        class: 'text-muted col-sm-12'
    }, 'Uploaded on: ' + uploadedOn.toString())
    const div = el('div', {
        class: 'row'
    }, [h5, small])
    return div;
}

const getMediaItems = (item) => {
    const {
        youtubeID,
        youtubeTitle,
        // s3URL
    } = item;
    const youtubeLink = youtubeSection(youtubeID, youtubeTitle);
    // const s3URLLink = s3Section(s3URL, 'Video File', 'Download ⏬');
    const youtubeDIV = el('div', {
        class: 'col-sm-12',
        style: 'float: left;'
    }, [youtubeLink])
    // const s3DIV = el('div', {
    //     class: 'col-sm-12',
    //     style: 'float: left;'
    // }, [s3URLLink]);
    return [youtubeDIV];
}

const createVideoHistoryItem = (item) => {
    const {
        videoDescription,
        bookName,
        section,
        videoTitle,
        uploadedOn,
        tutorName,
        fileName,
        chapterPart,
        chapterNumber,
        chapterName,
        classN
    } = item;

    const header = createHeader(videoTitle, uploadedOn);

    const metaData = createMetaData({
        'Book Name': bookName,
        'Chapter Name': chapterName,
        'Chapter Number': chapterNumber,
        'Chapter Part': chapterPart,
        'Section': section,
        'Video Description': videoDescription,
        'Tutor': tutorName,
        'File Name': fileName,
    });

    const rowMedia = el('div', {
        class: 'row'
    }, getMediaItems(item));

    const br = el('br');

    return el('div', {
        class: 'video-history-item'
    }, [
        header,
        br,
        metaData,
        br,
        rowMedia
    ]);
}

function youtubeSection(mediaId, youtubeTitle) {
    const link = el('a', {
        href: 'https://www.youtube.com/watch?v=' + mediaId,
        target: '_blank'
    }, 'youtube.com/watch?v=' + mediaId);

    const status = el('span', {
        class: 'video-status badge badge-' + (mediaId ? 'success' : 'warning')
    }, mediaId ? 'live' : 'pending');

    const title = el('b', {}, 'YouTube: ');

    const br = el('br');

    let wrappedEls = [
        title, document.createTextNode(youtubeTitle) ,status, br
    ];
    mediaId && wrappedEls.push(link);
    const wrapper = el('p', {}, wrappedEls);
    const container = el('div', {}, [wrapper]);
    return container;
}


function s3Section(s3URL, linkLabelPrefix, mediaTitle) {
    const link = el('a', {
        href: s3URL,
        target: '_blank'
    }, linkLabelPrefix);

    const title = el('b', {}, mediaTitle);

    const br = el('br');
    let wrappedEls = [
        title, br
    ];
    s3URL && wrappedEls.push(link);
    const wrapper = el('p', {}, wrappedEls);
    const container = el('div', {}, [wrapper]);
    return container;
}
