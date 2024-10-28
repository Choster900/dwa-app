$(document).ready(function () {
    $('.signIn-createBtn').on('click', function (e) {
        e.preventDefault();

        const email = $('#username').val().trim();
        const password = $('#password-field').val().trim();
        const errorMessage = $('#error-message');

        if (!email || !password) {
            errorMessage.text('Please fill in both email and password fields.').show();
            return;
        }

        // Obtener usuarios por email y password
        $.ajax({
            type: 'GET',
            url: `${baseURL}/users?email=${email}&password=${password}`,
            dataType: 'json',
            success: function (response) {
                if (response.length > 0) {
                    const user = response[0];
                    errorMessage.hide();

                    localStorage.setItem('userId', user.id);

                    document.cookie = `userId=${user.id}; path=/; max-age=${7 * 24 * 60 * 60};`;

                    console.log('User ID saved to Local Storage and Cookies:', user.id);

                    window.location.href = 'index.html';

                } else {
                    errorMessage.text('No user found with the provided credentials.').show();
                }
            },
            error: function () {
                errorMessage.text('Error occurred while trying to log in. Please try again.').show();
            }
        });
    });



    $('.signIn-createBtn').on('click', function (e) {
        e.preventDefault();

        const name = $('#name').val().trim();
        const username = $('#username').val().trim();
        const email = $('#email').val().trim();
        const password = $('#password-field').val().trim();
        const errorMessage = $('#error-message');

        if (!name || !username || !email || !password) {
            errorMessage.text('All fields are required.').show();
            return;
        }

        function generateJWT() {
            return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ6"; // Dejamos un jwt quedamos por si acaso para despues
        }

        const createdAt = new Date().toISOString();

        const userData = {
            name: name,
            username: username,
            email: email,
            password: password,
            couponId: null,
            jwt: generateJWT(),
            roles: ["guest"],
            centralAmericaCountrieId: "" ,
            phoneNumber: "" ,
            houseNumberAndStreetName: "",
            created_at: createdAt,
            updated_at: null
        };

        $.ajax({
            type: 'POST',
            url: baseURL + '/users',
            contentType: 'application/json',
            data: JSON.stringify(userData),
            success: function (response) {
                console.log('User created successfully:', response);


                localStorage.setItem('userId', response.id);

                document.cookie = `userId=${response.id}; path=/; max-age=${7 * 24 * 60 * 60};`;

                console.log('User ID saved to Local Storage and Cookies:', response.id);

                errorMessage.hide();
                //alert('User account created successfully!');
                window.location.href = 'index.html';

            },
            error: function () {
                errorMessage.text('Error occurred while trying to create the user. Please try again.').show();
            }
        });
    });

});