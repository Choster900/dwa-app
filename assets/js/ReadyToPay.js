
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

$(document).ready(function () {

    const userId = getCookie('userId');

    $(document).on("click", "#pay", function () {
        // Obtener el carrito de compras del usuario
        $.ajax({
            type: "GET",
            url: baseURL + "/shopping_cart?_embed=product&isSelled=false&userId=" + userId,
            dataType: "json",
            success: function (respondeCart) {
                const contentCart = respondeCart; // Asumiendo que respondeCart es un array

                // Obtener el cupón y la información del país
                $.ajax({
                    type: "GET",
                    url: `${baseURL}/users?_embed=coupon&id=${userId}&_embed=centralAmericaCountrie`,
                    dataType: "json", // Cambiar a "json"
                    success: function (response) {
                        const coupon = response[0]?.coupon || {};

                        // Calcular el precio total de los productos en el carrito
                        const totPrice = contentCart.reduce((acc, cart) => {
                            const price = cart.product.discount_price !== null ? cart.product.discount_price : cart.product.product_price;
                            return acc + (price * cart.quantity);
                        }, 0);

                        // Aplicar el descuento si existe
                        const descuento = coupon.descuento ? totPrice * coupon.descuento : 0;
                        const shippingCost = response[0]?.centralAmericaCountrie.average_shipping_cost || 0; // Agregar manejo de errores

                        // Crear el objeto de datos para la factura
                        const data = {
                            userId: userId,
                            paymentMethodId: "1", // Asumiendo que el método de pago es estático por ahora
                            total_amount: (parseFloat(totPrice) - parseFloat(descuento) + parseFloat(shippingCost)).toFixed(2),
                            created_at: new Date().toISOString(), // Fecha actual
                            products: contentCart.map(cart => ({
                                productId: cart.product.id,
                                quantity: cart.quantity,
                                price: cart.product.discount_price !== null ? cart.product.discount_price : cart.product.product_price
                            })) // Agregar detalles de productos
                        };

                        console.log(data); // Para depuración

                        // Enviar la información de la factura a la API
                        $.ajax({
                            type: "POST",
                            url: baseURL + "/invoices", // Cambiar a la URL correcta para crear la factura
                            contentType: "application/json",
                            data: JSON.stringify(data),
                            success: function (invoiceResponse) {
                                console.log("Factura creada con éxito:", invoiceResponse);

                                // Eliminar productos del carrito después de crear la factura
                                const deleteRequests = contentCart.map(cart => {
                                    return $.ajax({
                                        type: "DELETE",
                                        url: `${baseURL}/shopping_cart/${cart.id}`, // Asumiendo que 'cart.id' es el ID del carrito
                                        contentType: "application/json"
                                    });
                                });

                                // Esperar a que todas las solicitudes de eliminación se completen
                                $.when.apply($, deleteRequests).done(function () {
                                    console.log("Productos eliminados del carrito con éxito.");
                                    // Aquí puedes agregar lógica adicional, como redirigir al usuario o mostrar un mensaje
                                }).fail(function (error) {
                                    console.error("Error al eliminar productos del carrito:", error);
                                });
                            },
                            error: function (error) {
                                console.error("Error al crear la factura:", error);
                            }
                        });
                    },
                    error: function (e) {
                        console.error("Error al obtener el cupón.", e);
                    }
                });

            },
            error: function (e) {
                console.error("Error al obtener el carrito de compras.", e);
            }
        });
    });





    /*  $(document).on("click", "#pay", function () {
 
         $.ajax({
             type: "POST",
             url: "http://localhost:8080/api/wompi/getToken",
             contentType: "application/x-www-form-urlencoded",
             dataType: "json",
             success: function (response) {
                 const accessToken = response.access_token; // Guardar el token recibido
                 //  console.log(accessToken);
 
                 // Segunda llamada con el Bearer token
                 $.ajax({
                     type: "POST",
                     url: "http://localhost:8080/api/wompi/createTransaction",
                     headers: {
                         "Authorization": "Bearer " + accessToken // Enviar el token como Bearer
                     },
                     data: JSON.stringify({
                         "tarjetaCreditoDebido": {
                             "numeroTarjeta": "5227303702284005",
                             "cvv": "140",
                             "mesVencimiento": 8,
                             "anioVencimiento": 2027
                         },
                         "monto": 0.01,
                         "configuracion": {
                             "emailsNotificacion": "16adonaysergio@gmail.com",
                             "urlWebhook": null,
                             "telefonosNotificacion": "61621431",
                             "notificarTransaccionCliente": true
                         },
                         "urlRedirect": "http://localhost:92/payment-status.html",
                         "nombre": "string",
                         "apellido": "string",
                         "email": "user@example.com",
                         "ciudad": "test",
                         "direccion": "test",
                         "idPais": "SV",
                         "idRegion": "SV-LI",
                         "codigoPostal": "05003",
                         "telefono": "61621431",
                         "datosAdicionales": {
                             "additionalProp1": "string",
                             "additionalProp2": "string",
                             "additionalProp3": "string"
                         }
                     }),
                     contentType: "application/json", // Cambia a application/json si el API de Wompi requiere JSON en el cuerpo
                     dataType: "json",
                     success: function (response) {
                         console.log("Transacción exitosa:", response);
                       //  window.location.href = response.urlCompletarPago3Ds;
 
                     },
                     error: function (xhr, status, error) {
                         console.error("Error en la transacción:", xhr.responseText);
                     }
                 });
             },
             error: function (xhr, status, error) {
                 console.error("Error al obtener token:", xhr.responseText);
             }
         });
     }); */



});
