
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

$(document).ready(function () {

    const userId = getCookie('userId');

    /*  $(document).on("click", "#pay", async function () {
         try {
             // Obtener el carrito de compras
             const contentCart = await $.ajax({
                 type: "GET",
                 url: `${baseURL}/shopping_cart?_embed=product&isSelled=false&userId=${userId}`,
                 dataType: "json"
             });
 
             // Obtener cupón e información del país
             const userData = await $.ajax({
                 type: "GET",
                 url: `${baseURL}/users?_embed=coupon&id=${userId}&_embed=centralAmericaCountrie`,
                 dataType: "json"
             });
 
             const coupon = userData[0]?.coupon || {};
             const shippingCost = userData[0]?.centralAmericaCountrie?.average_shipping_cost || 0;
 
             // Calcular el precio total del carrito
             const totPrice = contentCart.reduce((acc, cart) => {
                 const price = cart.product.discount_price ?? cart.product.product_price;
                 return acc + (price * cart.quantity);
             }, 0);
 
             const descuento = coupon.descuento ? totPrice * coupon.descuento : 0;
             const totalAmount = (totPrice - descuento + shippingCost).toFixed(2);
 
             // Obtener token de Wompi
             const { access_token: accessToken } = await $.ajax({
                 type: "POST",
                 url: "http://localhost:8080/api/wompi/getToken",
                 contentType: "application/x-www-form-urlencoded",
                 dataType: "json"
             });
 
             // Crear transacción con token
             const transactionResponse = await $.ajax({
                 type: "POST",
                 url: "http://localhost:8080/api/wompi/createTransaction",
                 headers: { "Authorization": `Bearer ${accessToken}` },
                 contentType: "application/json",
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
                     "urlRedirect": "http://localhost:93/payment-status.html",
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
                 dataType: "json"
             });
 
             // Crear la factura
             const invoiceData = {
                 userId: userId,
                 paymentMethodId: "1",
                 total_amount: totalAmount,
                 created_at: new Date().toISOString(),
                 products: contentCart.map(cart => ({
                     productId: cart.product.id,
                     quantity: cart.quantity,
                     price: cart.product.discount_price ?? cart.product.product_price
                 }))
             };
 
             const invoiceResponse = await $.ajax({
                 type: "POST",
                 url: `${baseURL}/invoices`,
                 contentType: "application/json",
                 data: JSON.stringify(invoiceData)
             });
 
             console.log("Factura creada con éxito:", invoiceResponse);
 
             // Eliminar productos del carrito
             const deletePromises = contentCart.map(cart => {
                 return $.ajax({
                     type: "DELETE",
                     url: `${baseURL}/shopping_cart/${cart.id}`,
                     contentType: "application/json"
                 });
             });
 
             await Promise.all(deletePromises);
             console.log("Productos eliminados del carrito con éxito.");
 
             // Redirigir al usuario
             //window.location.href = transactionResponse.urlCompletarPago3Ds;
 
         } catch (error) {
             console.error("Error en el proceso de pago:", error);
         }
     }); */






    $(document).on("click", "#pay", function () {

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
                        "urlRedirect": "http://localhost:93/payment-status.html",
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
                        window.location.href = response.urlCompletarPago3Ds;

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
    });



});
