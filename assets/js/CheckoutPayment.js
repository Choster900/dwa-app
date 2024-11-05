function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

$(document).ready(function () {

    const months = [
        { id: "01", name: "Jan" },
        { id: "02", name: "Feb" },
        { id: "03", name: "Mar" },
        { id: "04", name: "Apr" },
        { id: "05", name: "May" },
        { id: "06", name: "Jun" },
        { id: "07", name: "Jul" },
        { id: "08", name: "Aug" },
        { id: "09", name: "Sep" },
        { id: "10", name: "Oct" },
        { id: "11", name: "Nov" },
        { id: "12", name: "Dec" }
    ];

    months.forEach(function (month) {
        $("#month").append(`<option value="${month.id}">${month.name}</option>`);
    });

    const currentYear = new Date().getFullYear();
    const maxYear = currentYear + 10; // Rango de años hasta el año actual + 10

    for (let year = currentYear; year <= maxYear; year++) {
        $("#year").append(`<option value="${year}">${year}</option>`);
    }


    const userId = getCookie('userId');


    $.ajax({
        type: "GET",
        url: `${baseURL}/paymentMethods?status=active&userId=${userId}`,
        dataType: "json",
        success: function (response) {
            if (response && response.length > 0) {
                const { cardNumber, cardHolderName, expirationDate, securityCode } = response[0];

                // Populate the form with data from the payment method
                $("#payment1").val(cardNumber);
                $("#payment2").val(cardHolderName);

                // Format month and year to match select values
                const [month, yearSuffix] = expirationDate.split("/").map(part => part.padStart(2, '0'));
                const year = `20${yearSuffix}`;

                // Set the values in the select elements
                $("#month").val(month).trigger('change');
                $("#year").val(year).trigger('change');
                $("#payment5").val(securityCode);
            } else {
                console.warn("No active payment methods found for the user.");
            }
        },
        error: function () {
            console.error("Failed to retrieve payment methods.");
        }
    });


    $.ajax({
        type: "GET",
        url: baseURL + "/shopping_cart?_embed=product&isSelled=false&userId=" + userId,
        dataType: "json",
        success: function (response) {
            calcularTotalCompra(response);
        }
    });

    function calcularTotalCompra(totalOrder) {
        $.ajax({
            type: "GET",
            url: `${baseURL}/users?_embed=coupon&id=${userId}&_embed=centralAmericaCountrie`,
            dataType: "json",
            success: function (response) {
                console.log(response);

                const coupon = response[0]?.coupon || {};
                const totPrice = totalOrder.reduce((acc, cart) => {
                    const price = (cart.product.discount_price !== null && cart.product.discount_price !== 0)
                        ? cart.product.discount_price
                        : cart.product.product_price;
                    return acc + (price * cart.quantity);
                }, 0);

                // Mostrar el subtotal antes de aplicar el descuento
                $('#subtotal-value').text(`$${totPrice.toFixed(2)}`);

                const descuento = coupon.descuento ? totPrice * coupon.descuento : totPrice;
                const shippingCost = response[0].centralAmericaCountrie.average_shipping_cost;

                if (coupon.descuento) {
                    $("#discount-price").text(`- $${(descuento).toFixed(2)}`);
                    $("#discount-div").show(); // Asegúrate de mostrar el div del descuento
                    $("#percent-discount").text(parseFloat(coupon.descuento) * 100 + "% OFF");
                    $("#coupon-code").val(coupon.codigo);
                    $("#shipping-charge").text("$" + shippingCost.toFixed(2));
                    $("#total-total").text("$" + (parseFloat(totPrice) - parseFloat(descuento) + parseFloat(shippingCost)).toFixed(2));
                } else {
                    $("#discount-price").text(`- $${(descuento).toFixed(2)}`);
                    $("#discount-div").show(); // Asegúrate de mostrar el div del descuento
                    $("#percent-discount").text(parseFloat(coupon.descuento) * 100 + "% OFF");
                    $("#coupon-code").val(coupon.codigo);
                    $("#shipping-charge").text("$" + shippingCost.toFixed(2));
                    $("#total-total").text("$" + (parseFloat(totPrice) + parseFloat(shippingCost)).toFixed(2));
                    $("#discount-div").hide(); // Ocultar si no hay descuento
                }
                //recalcularTotal()
                // Actualiza el precio final
                $('#final-price').text(`$${descuento.toFixed(2)}`); // Asegúrate de tener un elemento para mostrar el precio final
            },
            error: function () {
                console.error("Error al obtener el cupón.");
            }
        });
    }

    $(document).on('submit', '#coupon-form', function (e) {
        e.preventDefault(); // Evita el envío por defecto del formulario

        const couponCode = $('#coupon-code').val().trim();

        // Validar que el campo no esté vacío
        if (!couponCode) {
            alert('Please enter a coupon code.');
            return;
        }

        // Realizar llamada AJAX para buscar el cupón en JSON Server
        $.ajax({
            url: `${baseURL}/coupons?codigo=${couponCode}`,
            method: 'GET',
            success: function (coupons) {
                if (coupons.length > 0) {
                    const coupon = coupons[0]; // Toma el primer resultado
                    // Aplicar el descuento según el tipo de cupón
                    console.log(coupon);

                    $.ajax({
                        type: "PATCH",
                        url: baseURL + "/users/" + userId,
                        data: JSON.stringify({ couponId: coupon.id }),
                        dataType: "json",
                        success: function (response) {

                            $.ajax({
                                type: "GET",
                                url: baseURL + "/shopping_cart?_embed=product&isSelled=false&userId=" + userId,
                                dataType: "json",
                                success: function (response) {
                                    calcularTotalCompra(response);
                                }
                            });

                            console.log("cupo agregado al usuario", response);

                        }
                    });
                } else {
                    alert('Coupon not found or invalid.');
                }
            },
            error: function () {
                alert('Error applying coupon.');
            }
        });
    });


    $(document).on("click", "#btn-save-next", function () {
        // Captura los valores de cada campo del formulario
        const cardNumber = $("#payment1").val().trim();
        const cardHolderName = $("#payment2").val().trim();
        const month = $("#month").val();
        const year = $("#year").val();
        const securityCode = $("#payment5").val().trim();

        // Verificación de campos requeridos
        let isValid = true;
        if (!cardNumber) {
            alert("Please enter your card number.");
            isValid = false;
        }
        if (!cardHolderName) {
            alert("Please enter the name on the card.");
            isValid = false;
        }
        if (!month) {
            alert("Please select the expiration month.");
            isValid = false;
        }
        if (!year) {
            alert("Please select the expiration year.");
            isValid = false;
        }
        if (!securityCode) {
            alert("Please enter the CVV code.");
            isValid = false;
        }

        // Si algún campo es inválido, detener la ejecución
        if (!isValid) {
            return;
        }

        // Datos para enviar
        const paymentMethodData = {
            userId: userId,
            cardType: "credit",
            cardHolderName: cardHolderName,
            cardNumber: cardNumber,
            expirationDate: `${month}/${year.slice(-2)}`,  // Formatea el mes/año
            securityCode: securityCode,
            billingAddress: {
                street: $("#billing-street").val(),
                city: $("#billing-city").val(),
                postalCode: $("#billing-postalCode").val(),
                country: $("#billing-country").val()
            },
            issuingBank: "Example Bank",
            status: "active"
        };

        // Verificación y envío de solicitud GET para decidir si hacer POST o PATCH
        $.ajax({
            type: "GET",
            url: `${baseURL}/paymentMethods?userId=${userId}&status=active`,
            dataType: "json",
            success: function (response) {
                if (response.length > 0) {
                    const paymentMethodId = response[0].id;
                    $.ajax({
                        type: "PATCH",
                        url: `${baseURL}/paymentMethods/${paymentMethodId}`,
                        contentType: "application/json",
                        data: JSON.stringify(paymentMethodData),
                        success: function () {
                            //alert("Payment method updated successfully.");

                            window.location.href = 'checkout-review.html';

                        },
                        error: function () {
                            alert("Failed to update payment method. Please try again.");
                        }
                    });
                } else {
                    $.ajax({
                        type: "POST",
                        url: `${baseURL}/paymentMethods`,
                        contentType: "application/json",
                        data: JSON.stringify(paymentMethodData),
                        success: function () {
                            alert("Payment method created successfully.");
                        },
                        error: function () {
                            alert("Failed to create payment method. Please try again.");
                        }
                    });
                }
            },
            error: function () {
                alert("Failed to retrieve payment methods. Please try again.");
            }
        });
    });



});