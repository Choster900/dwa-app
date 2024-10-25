function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

$(document).ready(function () {
    const userId = getCookie('userId');

    if (userId) {
        $.ajax({
            type: 'GET',
            url: `${baseURL}/users/${userId}`,
            dataType: 'json',
            success: function (response) {
                if (response) {
                    console.log('User found:', response);


                    // Update the user information
                    $('#username').val(response.username);
                    $('#email').val(response.email);
                    $('#phone').val(response.phone);
                    $('#address').val(response.address);
                    $('#city').val(response.city);
                    $('#state').val(response.state);
                    $('#country').val(response.country);
                    $('#zipCode').val(response.zip_code);
                    
                } else {
                    console.error('No user found with the provided ID.');
                }
            },
            error: function () {
                console.error('Error occurred while trying to retrieve the user.');
            }
        });
    } else {
        console.log('No userId cookie found.');
    }
});
