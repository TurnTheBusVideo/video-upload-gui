let signedURL = false
const sendFile = function (event) {
    console.log('event', event)
    if (signedURL) {
        $.ajax({
            type: "PUT",
            url: signedURL,
            contentType: "application/octet-stream",
            data: event.target.result,
            async: false,
            cache: false,
            contentType: false,
            processData: false,
            success: function (data, textStatus, jqXHR) {
                try {
                    console.log('data', data)
                    $('#uploadMask').attr('hidden', true)
                    $('#uploadSucc').removeAttr('hidden')
                } catch (e) {
                    setError('Server response error, please check console/network logs.', e)
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                setError('Could not upload file, please check console/network logs.')
            }
        })
    } else {
        setError('Server error.')
    }
}
const reader = new FileReader()
reader.onload = sendFile
window.onload = event => {
    $('#uploadMask').attr('hidden', true)
    $('#uploadError').attr('hidden', true)
    $('#uploadSucc').attr('hidden', true)
    try {
        $('#submitUploadForm').click(event => {
            $('#uploadMask').removeAttr('hidden')
            $('#uploadError').attr('hidden', true)
            $('#uploadSucc').attr('hidden', true)
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
                        reader.readAsBinaryString(selectedFile)
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
function setError(msg, e) {
    $('#uploadError').html(msg);
    $('#uploadError').removeAttr('hidden');
    $('#uploadMask').attr('hidden', true);
    console.error(e)
}

