function formSubmit() {

    $('#sub_btn').css('display', 'none')
    $('#sub_load').css('display', 'block')

    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    (function(){
        var check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
                // redirect = false
            }
        }

        if (check) {
            // console.log(window.location.href)
            // window.location.href = '/pmap/'
            let d = {};
            d.username = input[0].value;
            d.password = input[1].value;
            $.ajax({
                url: `${URLs()}/get/userRole`,
                type: "POST",
                dataType:'json',
                data: d,
                success: function (data) {
                    console.log(data)
                    if (data.validated == true) {
                        switch(data.role) {
                            case 'pmap_user': {
                                localStorage.setItem('login_pmap', true)
                                $('#sub_btn').css('display', 'block')
                                $('#sub_load').css('display', 'none')
                                setTimeout(() => {
                                    window.location.href = `/pmap`;
                                }, 200)
                                break;
                            }
                            case 'pdnet_user': {
                                localStorage.setItem('login_pdnet', true)
                                $('#sub_btn').css('display', 'block')
                                $('#sub_load').css('display', 'none')
                                setTimeout(() => {
                                    window.location.href = `/pdnet`;
                                }, 200)
                                break;
                            }
                            case 'proteo_user': {
                                alert('This development is under progress')
                                // window.location.href = "/proteostatis"
                                $('#sub_btn').css('display', 'block')
                                $('#sub_load').css('display', 'none')
                                break;
                            }
                            case 'datalens_user': {
                                alert('This development is under progress')
                                // window.location.href = "/datalens"
                                $('#sub_btn').css('display', 'block')
                                $('#sub_load').css('display', 'none')
                                break;
                            }
                        }
                    } else {
                        $('#sub_btn').css('display', 'block')
                        $('#sub_load').css('display', 'none')
                        alert('Please enter valid creadentials')
                    }
                    
                },
                statusCode: {
                    404: function () {
                        $('#sub_btn').css('display', 'block')
                        $('#sub_load').css('display', 'none')
                        alert('There was a problem with the server.  Try again soon!');
                    }
                },
                error: () => {
                    $('#sub_btn').css('display', 'block')
                    $('#sub_load').css('display', 'none')
                }
            });
        }

        // return check;
    })();


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        // console.log('------------->', input)
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    
}

function myFunction(event) {
    var x = event.which || event.keyCode;
    if (x == 13) {
        formSubmit()
    }
}

// })(jQuery);