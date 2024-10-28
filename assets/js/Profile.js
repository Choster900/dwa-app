function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function getParameterByName(name) {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


$(document).ready(function () {

    const userId = getCookie('userId');
    const username = getParameterByName('username');

    /* if (userId) { */
    $.ajax({
        type: 'GET',
        url: `${baseURL}/users?username=${username}`,
        dataType: 'json',
        success: function (res) {

            if (res) {

                const response = res[0]

                // Update the user information
                $('.ap-nameAddress__title').text(response.name);
                $('.ap-nameAddress__subTitle').text(response.username);
                $('#names').val(response.name);

                $('#phoneNumber1').val(response.phoneNumber);
                $("#houseNumberAndStreetName").val(response.houseNumberAndStreetName);

                loadCountries(response.centralAmericaCountrieId);


                if (response.id != userId) {
                    $("div.actions-buttons").hide();
                }

                $("#name1").val(response.username);
                $("#span-username").text(response.username);
                $("#email45").val(response.email);
            } else {
                console.error('No user found with the provided ID.');
            }
        },
        error: function () {
            console.error('Error occurred while trying to retrieve the user.');
        }
    });
    /* } else {
        console.log('No userId cookie found.');
        $("div.actions-buttons").hide();
    } */

    var countrySelect = $('#select-alerts2');


    function loadCountries(selectedCountryId) {
        $.ajax({
            type: "GET",
            url: baseURL + "/centralAmericaCountries",
            dataType: "json",
            success: function (response) {

                const countryData = response.map(country => ({
                    id: country.id,
                    text: country.name
                }));

                // Inicializar Select2 con los datos procesados
                countrySelect.select2({
                    placeholder: "Select a country",
                    data: countryData,
                    allowClear: true
                });

                // Opcional: para seleccionar una opción por defecto si deseas
                if (selectedCountryId) {

                    countrySelect.val(selectedCountryId).trigger('change');
                } else {
                    countrySelect.val(null).trigger('change');
                }
            },
            error: function (error) {
                console.error("Error loading countries:", error);
            }
        });
    }


    $(document).on('click', '#update-profile', function (event) {
        event.preventDefault();

        const userId = getCookie('userId'); // Asegúrate de obtener el userId correctamente
        if (!userId) {
            console.error("User ID not found.");
            return;
        }

        $.ajax({
            type: "PATCH",
            url: `${baseURL}/users/${userId}`,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify({
                name: $("#names").val(),
                centralAmericaCountrieId: countrySelect.val(),
                phoneNumber: $('#phoneNumber1').val(),
                houseNumberAndStreetName: $("#houseNumberAndStreetName").val(),
            }),
            success: function (response) {
            },
            error: function (xhr, status, error) {
                console.error("Error updating profile:", error);
            }
        });

    });

    $(document).on("click", "#btn-save-account-settings", function (event) {

        event.preventDefault();

        const userId = getCookie('userId'); // Asegúrate de obtener el userId correctamente
        if (!userId) {
            console.error("User ID not found.");
            return;
        }

        $.ajax({
            type: "PATCH",
            url: `${baseURL}/users/${userId}`,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify({
                username: $("#name1").val(),
            }),
            success: function (response) {
                console.log("Profile updated successfully:", response);
            },
            error: function (xhr, status, error) {
                console.error("Error updating profile:", error);
            }
        });
    });

    $(document).on("click", "#btn-change-password", function (e) {
        e.preventDefault();

        const oldPasswordInput = $("#old-password");
        const newPasswordInput = $("#new-password");
        const oldPassword = oldPasswordInput.val();
        const newPassword = newPasswordInput.val();

        // Validar que los campos no estén vacíos
        if (!oldPassword || !newPassword) {
            alert("Both fields are required");
            return;
        }

        $.ajax({
            type: "GET",
            url: `${baseURL}/users/${userId}`,
            dataType: "json",
            success: function (response) {
                if (oldPassword !== response.password) {
                    alert("Incorrect password");
                    return;
                }

                // Actualizar la contraseña si coincide la contraseña actual
                $.ajax({
                    type: "PATCH",
                    url: `${baseURL}/users/${userId}`,
                    contentType: "application/json",
                    data: JSON.stringify({ password: newPassword }),
                    dataType: "json",
                    success: function () {
                        console.log("Password changed successfully");

                        // Limpiar los campos de entrada después de la actualización
                        oldPasswordInput.val("");
                        newPasswordInput.val("");
                    },
                    error: function () {
                        alert("Failed to update password. Please try again.");
                    }
                });
            },
            error: function () {
                alert("Error fetching user data. Please try again.");
            }
        });
    });






});
