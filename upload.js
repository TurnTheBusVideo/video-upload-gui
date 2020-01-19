

window.onload = event => {
    $('#uploadMask').attr('hidden', true)

    $.ajax({
        method: "GET",
        // async:true,
        url: "https://6bvu1dfzvl.execute-api.ap-south-1.amazonaws.com/test/getsignedurl",
        // crossDomain:true,
        dataType: 'jsonp',
        success: function (data, textStatus, jqXHR) {
            console.log('data', data);
            // let signedURL = 'facebook.com'
            // $.ajax({
            //     method: "PUT",
            //     contentType: "application/octet-stream",
            //     url: signedURL,
            //     data: formData,
            //     success: function (data, textStatus, jqXHR) {
            //         alert('everything was OK');
            //     }
            // });
        }
    });


    $('#submitUploadForm').click(event => {
        $('#uploadMask').removeAttr('hidden')
        let formURL = $('#ttbVideoUploadForm').attr('action')
        let formData = $('#file').val()
        

        //   event.preventDefault();
    })
}