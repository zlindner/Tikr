$(document).ready(function() {
    $('.form-login input[name="login"]').click(function(e) {
        e.preventDefault();
        login();
    }); 

    $('.form-login input[name="create"]').click(function() {
        $('.form-login').hide();

        $('.wrapper-form').css('height', '360px');
        $('.form-create-account').show();
    });

    $('.form-create-account input[name="create"]').click(function(e) {
        e.preventDefault();
        createAccount();
    });

    $('.form-create-account input[name="login"]').click(function() {
        $('.form-create-account').hide();

        $('.wrapper-form').css('height', '320px');
        $('.form-login').show();
    });
});

function login() {
    let username = $('.form-login input[name="username"]').val();
    let password = $('.form-login input[name="password"]').val();
        
    console.log('Username: ' + username + '\nPassword: ' + password);
}

function createAccount() {
    let email = $('.form-create-account input[name="email"').val();
    let password = $('.form-create-account input[name="password"').val();
    let password2 = $('.form-create-account input[name="password2"').val();

    console.log('Email: ' + email + '\nPassword: ' + password + '\nPassword2: '+ password2);
}