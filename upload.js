window.onload = event => {
    $('#uploadMask').attr('hidden', true)
    $('#ttbVideoUploadForm').submit(event => {
        $('#uploadMask').removeAttr('hidden')
    })
}