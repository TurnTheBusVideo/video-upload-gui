window.onload = event => {
    $('#uploadMask').attr('hidden', true)

    $('#submitUploadForm').click(event => {
        $('#uploadMask').removeAttr('hidden')
        $.ajax({
            type: "GET",
            url: "https://6bvu1dfzvl.execute-api.ap-south-1.amazonaws.com/test/getsignedurl",
            crossdomain: true,
            contentType: 'application/json',
            dataType: 'json',
            success: function (data, textStatus, jqXHR) {
                let signedURL = JSON.parse(data.body).signedURL
                alert(signedURL)
                let selectedFile = $('#file')[0].files[0]
                $.ajax({
                    type: "PUT",
                    url: signedURL,
                    contentType: "application/octet-stream",
                    data: {
                        file: undefined
                    },
                    success: function (data, textStatus, jqXHR) {
                        alert('everything was OK')
                    }
                });
            }
        });
        event.preventDefault();
    })
}
