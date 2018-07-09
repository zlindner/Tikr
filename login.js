/* TODO:
 * 
 */

$(document).ready(function() {
    $('.form-login input[name="login"]').click(function(e) {
        e.preventDefault();
        login();
    }); 

    $('.form-login input[name="create"]').click(function() {
        $('.form-login').hide();

        $('.form-create-account').trigger('reset');
        $('.form-error').hide();
        $('.form-create-account').show();
    });

    $('.form-login input[name="forgot"]').click(function() {
        $('.form-login').hide();

        $('.form-forgot-password').trigger('reset');
        $('.form-error').hide();
        $('.form-forgot-password').show();
    });

    $('.form-create-account input[name="create"]').click(function(e) {
        e.preventDefault();
        createAccount();
    });

    $('.form-create-account input[name="login"]').click(function() {
        $('.form-create-account').hide();

        $('.form-login').trigger('reset');
        $('.form-error').hide();
        $('.form-login').show();
    });

    $('.form-forgot-password input[name="reset"]').click(function(e) {
        e.preventDefault();
        forgotPassword();
    });

    $('.form-forgot-password input[name="login"]').click(function() {
        $('.form-forgot-password').hide();

        $('.form-login').trigger('reset');
        $('.form-error').hide();
        $('.form-login').show();
    });
});

function login() {
    let email = $('.form-login input[name="email"]').val();
    let password = $('.form-login input[name="password"]').val(); 

    if (!validateEmail(email) || password.length == 0) {
        $('.form-error').text('Check your email and password and try again.');
        $('.form-error').show();
        return;
    }

    $.ajax({
        type: 'get',
        url: '/login',
        dataType: 'json',
        data: {
            email: email,
            password: password
        },
        success: function(data) {            
            if (data.status == 'fail') {
                $('.form-error').text('Check your email and password and try again.');
                $('.form-error').show();
                return;
            }
    
            $('.form-error').hide();

            // login
        },
        fail: function(error) {
            console.log(error);
        }
    });
}

function createAccount() {
    let email = $('.form-create-account input[name="email"]').val();
    let password = $('.form-create-account input[name="password"]').val();
    let password2 = $('.form-create-account input[name="password2"]').val();

    if (!validateEmail(email) || password.length == 0 || password2.length == 0 || password != password2) {
        $('.form-error').text('Check your email and passwords and try again.');
        $('.form-error').show();
        return;
    }

    $('.form-error').hide();

    $.ajax({
        type: 'get',
        url: '/createAccount',
        dataType: 'json',
        data: {
            email: email,
            password: password
        },
        success: function(data) {

        },
        fail: function(error) {
            console.log(error);
        }
    });
}

function forgotPassword() {
    let email = $('.form-forgot-password input[name="email"]').val();

    if (!validateEmail(email)) {
        $('.form-error').text('Check your email and try again.');
        $('.form-error').show();
        return;
    }

    $('.form-error').hide();
}

function validateEmail(email) {
    let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
}