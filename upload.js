window.onload = event => {
    $('#uploadMask').attr('hidden', true)
    $.ajax({
        type: "GET",
        url: "https://6bvu1dfzvl.execute-api.ap-south-1.amazonaws.com/test/getsignedurl",
        crossdomain: true,
        contentType: 'application/json',
        dataType: 'json',
        success: function (data, textStatus, jqXHR) {
            let signedURL = JSON.parse(data.body).signedURL
            let formData = $('#file').val()
            $.ajax({
                type: "PUT",
                url: signedURL,
                contentType: "application/octet-stream",
                data: formData,
                success: function (data, textStatus, jqXHR) {
                    alert('everything was OK')
                }
            });
        }
    });


    $('#submitUploadForm').click(event => {
        $('#uploadMask').removeAttr('hidden')
        let formURL = $('#ttbVideoUploadForm').attr('action')
        let formData = $('#file').val()
        

        //   event.preventDefault();
    })
}