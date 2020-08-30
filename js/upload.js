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
let fileNameUTC = false


const getFormValues = () => {
    var formFields = $('#ttbVideoUploadForm').serializeArray();
    var formFieldsObj = {};
    formFields.forEach(formField => {
        formFieldsObj[formField.name] = formField.value
    })
    return {
        tutorName: formFieldsObj.tutorName || "NULL",
        tutorProfile: formFieldsObj.tutorProfile || "NULL",
        classN: formFieldsObj.class || "NULL",
        stream: formFieldsObj.stream || "NULL",
        board: formFieldsObj.board || "NULL",
        subject: formFieldsObj.subject || "NULL",
        bookLanguage: formFieldsObj.bookLanguage || "NULL",
        bookName: formFieldsObj.bookName || "NULL",
        bookPartName: formFieldsObj.bookPartName || "NULL",
        chapterName: formFieldsObj.chapterName || "NULL",
        chapterNumber: formFieldsObj.chapterNumber || "NULL",
        chapterPart: formFieldsObj.chapterPart || "NULL",
        section: formFieldsObj.section || "NULL",
        title: formFieldsObj.title || "NULL",
        description: formFieldsObj.description || "NULL",
        videoLanguage: formFieldsObj.videoLanguage || "NULL",
        tags: formFieldsObj.tags || "Turn the bus, educational, tutorial, tutor, education",
        awsRegion: _config.cognito.region
    }
}

const updateFormOptions = (field, valuesString) => {
    if (valuesString && typeof valuesString === 'string' && valuesString.length) {
        field.innerHTML = '';
        const valuesArray = valuesString.split(',').map(value => value.trim());
        if (field.getAttribute('required') === null) {
            const emptyOption = document.createElement('option');
            field.appendChild(emptyOption);
        }
        valuesArray.forEach(trimmedValue => {
            const selectOption = document.createElement('option');
            selectOption.setAttribute('value', trimmedValue)
            selectOption.innerHTML = trimmedValue;
            field.appendChild(selectOption);
        })

    }
}

const setFormOptions = (items) => {
    if (items && items.length && items.length > 0) {
        items.forEach(item => {
            const { values, formFieldId } = item;
            const fields = $('#' + formFieldId);
            const field = fields && fields.length && fields.length === 1 ? fields[0] : false;
            if (field) {
                updateFormOptions(field, values);
            }
        })
    }
};

let bookOptions;

const handleBoardChange = (event) => {
    let selectedBoard = event.target.value;
    let boardSubjects = bookOptions.get(selectedBoard);

    let subjectField = $('#subject')[0];
    if (subjectField && boardSubjects) {
        let subjectFieldValue = [];
        boardSubjects.forEach((value, key) => {
            subjectFieldValue.push(key);
        });
        updateFormOptions(subjectField, subjectFieldValue.join(','));
        subjectField.dispatchEvent(new Event('change'));
    }
}

const handleSubjectChange = (event) => {
    let boardSubjects = bookOptions.get($('#board')[0].value);

    let selectedSubject = event.target.value;
    let subjectsBookLanguages = boardSubjects.get(selectedSubject);

    let bookLanguageField = $('#bookLanguage')[0];
    if (bookLanguageField && subjectsBookLanguages) {
        let languageValues = [];
        subjectsBookLanguages.forEach((value, key) => {
            languageValues.push(key);
        });
        updateFormOptions(bookLanguageField, languageValues.join(','));
        bookLanguageField.dispatchEvent(new Event('change'));
    }
}

const handleBookLanguageChange = (event) => {
    let boardSubjects = bookOptions.get($('#board')[0].value);
    let subjectLanguages = boardSubjects.get($('#subject')[0].value);

    let selectedLanguage = event.target.value;
    let bookNames = subjectLanguages.get(selectedLanguage);

    let bookNameField = $('#bookName')[0];
    if (bookNameField && bookNames) {
        let bookNameValues = [];
        bookNames.forEach((value, key) => {
            bookNameValues.push(key);
        });
        updateFormOptions(bookNameField, bookNameValues.join(','));
    }
}

const treeLevels = ['BOARD', 'SUBJECT', 'LANGUAGE', 'BOOK_NAME'];


const populateTree = (root, item, treeLevel) => {
    let itemValue = item[treeLevels[treeLevel]];
    if (treeLevel === treeLevels.length - 1) {
        root.set(itemValue);
        return;
    }
    let levelMap = root.get(itemValue);
    if (levelMap != undefined) {
        populateTree(levelMap, item, ++treeLevel);
    } else {
        let newTree = new Map();
        populateTree(newTree, item, ++treeLevel);
        root.set(itemValue, newTree);
    }
}

const populateBookOptions = (items) => {
    if (items && items.length && items.length > 0) {
        items.forEach(item => {
            populateTree(bookOptions, item, 0);
        });
        $('#board')[0].dispatchEvent(new Event('change'));
    }
}


function populateSubjectMap(item, boardMap) {
    let itemSubject = item['SUBJECT'];
    let subjectMap = boardMap.get(itemSubject);
    if (subjectMap !== undefined) {
        populateLanguageMap(item, subjectMap);
    }
    else {
        let newSubjectMap = new Map();
        populateLanguageMap(item, newSubjectMap);
        boardMap.set(itemSubject, newSubjectMap);
    }
}

function populateLanguageMap(item, subjectMap) {
    let itemLanguage = item['LANGUAGE'];
    let languageMap = subjectMap.get(itemLanguage);
    if (languageMap !== undefined) {
        populateBookMap(item, languageMap);
    }
    else {
        let newLanguageMap = new Map();
        populateBookMap(item, newLanguageMap);
        subjectMap.set(itemLanguage, newLanguageMap);
    }
}

function populateBookMap(item, languageMap) {
    let itemBookName = item['BOOK_NAME'];
    languageMap.set(itemBookName);
}

const showForm = () => {
    const form = $('#ttbVideoUploadForm')[0];
    form.removeAttribute('hidden');
    const formLoader = $('#formLoader')[0];
    formLoader.setAttribute('hidden', true);
}

const getBookData = (formData) => {
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
                tableName: 'booksMetaData'
            },
            success: function (bookData, textStatus, jqXHR) {
                setFormOptions(formData.result.Items);
                bookOptions = new Map();
                populateBookOptions(bookData.result.Items);
                showForm();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                setError('GET: Cannot get form data. Please check console/network logs.');
            }
        });
    } else {
        setError('You are not authorized to perform this action.');
    }
}

const getFormData = () => {
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
                tableName: 'videoMetadata'
            },
            success: function (formData, textStatus, jqXHR) {
                getBookData(formData);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                setError('GET: Cannot get form data. Please check console/network logs.');
            }
        });
    } else {
        setError('You are not authorized to perform this action.');
    }
}

const updateVideoMetaData = () => {
    if (fileNameUTC) {
        $.ajax({
            type: "GET",
            url: _config.api.invokeUrl + "/updatevideometadata",
            crossdomain: true,
            contentType: 'application/json',
            dataType: 'json',
            headers: {
                Authorization: authToken
            },
            data: {
                bucket: 'test-turnthebus-upload',
                key: fileNameUTC,
                ...getFormValues()
            },
            success: function (data, textStatus, jqXHR) {
                hideMask();
                showSuccessMsg();
                $('#ttbVideoUploadForm')[0].reset();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                setError('POST: Could not update video data. Please check console/network logs.')
            }
        });
    } else {
        setError('Sever Error: Unknown uploaded filename. Please check console/network logs.')
    }
}

let uploadXhr = false;
let timeController;
let uploadedBytes = 0;
let totalBytes = 0;

const sendFile = function (formData) {
    setUploadProgress(0);
    if (signedURL && authToken && formData.get('file') && formData.get('file').name) {
        $('#uploadFileName').html(formData.get('file').name);
        const xhr = new XMLHttpRequest();
        this.xhr = xhr;
        this.xhr.upload.addEventListener("progress", function (e) {
            if (e.lengthComputable) {
                const percentage = Math.round((e.loaded * 100) / e.total);
                totalBytes = e.total;
                uploadedBytes = e.loaded;
                setUploadData(e.loaded, e.total);
                setUploadProgress(percentage);
            }
        }, false);
        console.log('signedURL');
        console.log(signedURL);

        xhr.open('POST', signedURL.url);
        xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && (xhr.status === 200 || xhr.status === 204)) {
                updateVideoMetaData();
                resetUploadState();
            }
            else if (xhr.readyState !== XMLHttpRequest.HEADERS_RECEIVED) {
                setError('POST: Server response error. Please check console/network logs.')
            }
        };
        xhr.send(formData);
        uploadXhr = xhr;
        let timeStarted = new Date();
        timeController = setInterval(function () {
            let timeElapsed = (new Date()) - timeStarted; // Assuming that timeStarted is a Date Object
            let uploadSpeed = uploadedBytes / (timeElapsed / 1000); // Upload speed in second

            // `callback` is the function that shows the time to user.
            // The only argument is the number of remaining seconds. 
            setEstimatedTimeRemaining((totalBytes - uploadedBytes) / uploadSpeed);
        }, 1000)
    } else {
        !signedURL && setError('Server Error!');
        !authToken && setError('Authorization Failed!');
    }
}


const handleSubmit = event => {
    event.preventDefault();
    const form = $('#ttbVideoUploadForm')[0];
    if (form.checkValidity() === false) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
    }
    showMask();
    hideUploadError();
    hideSuccessMsg();
    let selectedFile = $('#file')[0].files[0]
    if (!selectedFile) {
        setError('Please select a file to upload!');
        return;
    }
    const formDataValues = getFormValues();
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
            ...formDataValues
        },
        success: function (data, textStatus, jqXHR) {
            try {
                signedURL = data.signedURL;
                fileNameUTC = data.fileName;
                var formData = new FormData();
                Object.keys(signedURL.fields).forEach(key => {
                    formData.append(key, signedURL.fields[key]);
                });
                formData.append('file', selectedFile);
                sendFile(formData);
            } catch (e) {
                setError('GET: Server response error, please check console/network logs.', e)
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            setError('GET: Could not get signed URL, please check console/network logs.')
        }
    });
}

const handleReset = event => {
    const shouldReset = confirm('Do you want to clear this form?');
    if(!shouldReset){
        event.preventDefault();
    }
}

const cancelUploadHandler = event => {
    if (uploadXhr) {
        uploadXhr.abort();
        setWarning('Upload canceled!')
    }
    hideMask();
}

const openModal = event => {
    $('#uploadProgressModal').modal({
        backdrop: 'static',
        keyboard: false,
    })
}

window.onload = event => {
    resetState();
    $('#file').change(function (event) {
        const target = event.target;
        if (target && target.files && target.files.length && target.files.length === 1) {
            const file = target.files[0];
            if (file && file.name) {
                $('#fileName')[0].innerHTML = file.name;
            }
        }
    })
    $('#board').change(handleBoardChange);
    $('#subject').change(handleSubjectChange);
    $('#bookLanguage').change(handleBookLanguageChange);
    $('#signOut').click(function () {
        WildRydes.signOut();
        alert("You have been signed out.");
        window.location = "index.html";
    });
    getFormData();
    try {
        $('#submitUploadForm').click(handleSubmit);
        $('#resetUploadForm').click(handleReset);
        $('#debugSubmit').click(() => {
            console.debug(getFormValues());
        });
    } catch (e) {
        setError('Some error ocurred! Please try again.', e);
    }
    $('#cancelUpload').click(cancelUploadHandler);
    $('#modalTrigger').click(openModal);
}

function resetState() {
    hideMask();
    hideUploadError();
    hideSuccessMsg();
}

const resetUploadState = () => {
    clearInterval(timeController);
    setEstimatedTimeRemaining(0);
    resetUploadData();
}

function hideSuccessMsg() {
    $('#uploadSucc').attr('hidden', true);
}

function hideUploadError() {
    $('#uploadError').attr('hidden', true);
}

function showMask() {
    // $('#uploadMask').removeAttr('hidden');
    $('#uploadProgressModal').modal({
        backdrop: 'static',
        keyboard: false,
    })
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

function setWarning(msg, e) {
    $('#uploadWarning').html(msg);
    $('#uploadWarning').removeAttr('hidden');
    hideMask();
    e && console.error(e)
}

function hideMask() {
    // $('#uploadMask').attr('hidden', true)
    setUploadProgress(0);
    $('#uploadProgressModal').modal('hide')
}
function setUploadProgress(progressValue) {
    $('#uploadProgressBar').attr('aria-valuenow', progressValue)
    $('#uploadProgressValue').html(progressValue + '%')
    $('#uploadProgressBar').css('width', progressValue + '%')
}

function setUploadData(done, total) {
    $('#uploadDataDone').html(formatBytes(done) + ' of ')
    $('#uploadDataTotal').html(formatBytes(total))
}

function resetUploadData() {
    $('#uploadDataDone').html('')
    $('#uploadDataTotal').html('')
    $('#uploadFileName').html('');

}

function setEstimatedTimeRemaining(time) {
    $('#remainingTime').html(formatTime(time))

}
function formatTime(seconds) {
    let mill = seconds * 1000;
    let hoursRemaining = (Math.floor(mill / 1000 / 60 / 60)) % 24;
    let minutesRemaining = (Math.floor(mill / 1000 / 60)) % 60;
    let secondsRemaining = (Math.floor(mill / 1000)) % 60;
    let timeAr = []
    if (hoursRemaining > 0) {
        timeAr.push(`${hoursRemaining} hours`);
    }
    if (minutesRemaining > 0) {
        timeAr.push(`${minutesRemaining} minutes`);
    }
    if (secondsRemaining > 0) {
        timeAr.push(`${secondsRemaining} seconds`);
    }
    return timeAr.length ? timeAr.join(', ') + ' remaining' : '';
}
function formatBytes(a, b = 2) { if (0 === a) return "0 Bytes"; const c = 0 > b ? 0 : b, d = Math.floor(Math.log(a) / Math.log(1024)); return parseFloat((a / Math.pow(1024, d)).toFixed(c)) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d] }
