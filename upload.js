window.onload = event => {
    $('#uploadMask').addAttr('hidden')
    $('#ttbVideoUploadForm').submit(event => {
        $('#uploadMask').removeAttr('hidden')
    })
}