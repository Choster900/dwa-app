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
                } else {
                    console.error('No user found with the provided ID.');
                }

                // Ocultar todos los componentes específicos de roles al inicio
                $(".component-seller, .component-customer, .component-admin").hide();

                // Supongamos que `response.roles` es un array de roles del usuario
                const roles = response.roles;

                // Definir un objeto para almacenar la relación entre roles y componentes
                const roleComponents = {
                    'seller': '.component-seller',
                    'customer': '.component-customer',
                    'admin': '.component-admin'
                };

                // Recorrer los roles del usuario y mostrar los componentes según los roles asignados
                roles.forEach(role => {
                    const componentClass = roleComponents[role];
                    if (componentClass) {
                        $(componentClass).show();
                    }
                });

                // Ejemplo adicional: ocultar componentes específicos si el usuario es solo "admin"
                if (roles.includes('admin') && roles.length === 1) {
                    // Ocultar componentes específicos si el usuario tiene solo el rol 'admin'
                    $(".component-seller, .component-customer").hide();
                }


            },
            error: function () {
                console.error('Error occurred while trying to retrieve the user.');
            }
        });
    } else {
        console.log('No userId cookie found.');

        //window.location.href = 'index.html';
        $(".hidden-session-component").hide();
    }
});