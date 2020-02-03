var WildRydes = window.WildRydes || {};
WildRydes.map = WildRydes.map || {};

var authToken;
    WildRydes.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/index.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/index.html';
    });

let signedURL = false
const sendFile = function (event) {
    if (signedURL) {
        const xhr = new XMLHttpRequest();
        this.xhr = xhr;
        this.xhr.upload.addEventListener("progress", function (e) {
            if (e.lengthComputable) {
                const percentage = Math.round((e.loaded * 100) / e.total);
                setUploadProgress(percentage);
            }
        }, false);
        xhr.open('PUT', signedURL);
        xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                hideMask();
                showSuccessMsg();
            }
            else if (xhr.readyState !== XMLHttpRequest.HEADERS_RECEIVED) {
                setError('Server response error, please check console/network logs.')
            }
        };
        xhr.send(event.target.result);
    } else {
        setError('Server Error!');
    }
}
const reader = new FileReader()
reader.onload = sendFile
window.onload = event => {
    resetState();
    $('#signOut').click(function() {
        WildRydes.signOut();
        alert("You have been signed out.");
        window.location = "index.html";
    });
    try {
        $('#submitUploadForm').click(event => {
            showMask();
            hideUploadError();
            hideSuccessMsg();
            let selectedFile = $('#file')[0].files[0]
            $.ajax({
                type: "GET",
                url: "https://1bb73f90n5.execute-api.ap-south-1.amazonaws.com/test/getsignedurl",
                crossdomain: true,
                contentType: 'application/json',
                dataType: 'json',
                data: {
                    bucket: 'test-turnthebus-upload',
                    key: selectedFile.name
                },
                success: function (data, textStatus, jqXHR) {
                    try {
                        signedURL = data.signedURL
                        console.log('Signed URL', signedURL)
                        reader.readAsArrayBuffer(selectedFile)
                    } catch (e) {
                        setError('Server response error, please check console/network logs.', e)
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    setError('Could not get signed URL, please check console/network logs.')
                }
            });
            event.preventDefault();
        })
    } catch (e) {
        setError('Some error occurced! Please try again.', e);
    }
}
function resetState() {
    hideMask();
    hideUploadError();
    hideSuccessMsg();
}

function hideSuccessMsg() {
    $('#uploadSucc').attr('hidden', true);
}

function hideUploadError() {
    $('#uploadError').attr('hidden', true);
}

function showMask() {
    $('#uploadMask').removeAttr('hidden');
}

function showSuccessMsg() {
    $('#uploadSucc').removeAttr('hidden');
}

function setError(msg, e) {
    $('#uploadError').html(msg);
    $('#uploadError').removeAttr('hidden');
    hideMask();
    e && console.error(e)
}
function hideMask() {
    $('#uploadMask').attr('hidden', true)
}
function setUploadProgress(progressValue) {
    $('#uploadProgressBar').attr('aria-valuenow', progressValue)
    $('#uploadProgressBar').html(progressValue + '%')
    $('#uploadProgressBar').css('width', progressValue)
}