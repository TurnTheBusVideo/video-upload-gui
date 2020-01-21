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
                console.log('data', data)
                $('#uploadMask').attr('hidden', true)
                $('#uploadSucc').removeAttr('hidden')
            },
            error: function (jqXHR, textStatus, errorThrown) {
                setError('Could not upload file, please check console/network logs.')
            }
        })
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
                url: "https://6bvu1dfzvl.execute-api.ap-south-1.amazonaws.com/test/getsignedurl",
                crossdomain: true,
                contentType: 'application/json',
                dataType: 'json',
                data: {
                    bucket: 'test-turnthebus-upload',
                    key: 'voila.png'
                },
                success: function (data, textStatus, jqXHR) {
                    signedURL = JSON.parse(data.body).signedURL
                    console.log('Signed URL', signedURL)
                    reader.readAsBinaryString(selectedFile);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    setError('Could not get signed URL, please check console/network logs.')
                }
            });
            event.preventDefault();
        })
    } catch (e) {
        setError('Some error occurced! Please try again. 2');
    }
}
function setError(msg) {
    $('#uploadError').html(msg);
    $('#uploadError').removeAttr('hidden');
    $('#uploadMask').attr('hidden', true);
}

