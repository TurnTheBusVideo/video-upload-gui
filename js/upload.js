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

let signedURL = false


const getFormValues = () => {
    var formFields = $('#ttbVideoUploadForm').serializeArray();
    var formFieldsObj = {};
    formFields.forEach(formField => {
        formFieldsObj[formField.name] = formField.value
    })
    return {
        accessKey: formFieldsObj.accessKey || "",
        course: formFieldsObj.course || "",
        section: formFieldsObj.section || "",
        subsection: formFieldsObj.subsection || "",
        notes: formFieldsObj.notes || ""
    }
}

const sendFile = function (event) {
    if (signedURL && authToken) {
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
                setError('PUT: Server response error, please check console/network logs.')
            }
        };
        xhr.send(event.target.result);
    } else {
        !signedURL && setError('Server Error!');
        !authToken && setError('Authorization Failed!');
    }
}
const reader = new FileReader()
reader.onload = sendFile

const handleSubmit = event => {
    event.preventDefault();
    showMask();
    hideUploadError();
    hideSuccessMsg();
    let selectedFile = $('#file')[0].files[0]
    if (!selectedFile) {
        setError('Please select a file to upload!');
        return;
    }
    $.ajax({
        type: "GET",
        url: _config.api.invokeUrl + "/getsignedurl",
        crossdomain: true,
        contentType: 'application/json',
        dataType: 'json',
        headers: {
            Authorization: authToken
        },
        data: {
            bucket: 'test-turnthebus-upload',
            key: selectedFile.name,
            ...getFormValues()
        },
        success: function (data, textStatus, jqXHR) {
            try {
                signedURL = data.signedURL
                reader.readAsArrayBuffer(selectedFile)
            } catch (e) {
                setError('GET: Server response error, please check console/network logs.', e)
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            setError('Could not get signed URL, please check console/network logs.')
        }
    });
}

window.onload = event => {
    resetState();
    $('#signOut').click(function () {
        WildRydes.signOut();
        alert("You have been signed out.");
        window.location = "index.html";
    });
    try {
        $('#submitUploadForm').click(handleSubmit)
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