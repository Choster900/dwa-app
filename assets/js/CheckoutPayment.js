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
        url: baseURL + "/paymentMethods?status=active&userId=" + userId,
        dataType: "json",
        success: function (response) {
            const paymentMethod = response[0];

            // Populate the form with data from the payment method
            $("#payment1").val(paymentMethod.cardNumber);
            $("#payment2").val(paymentMethod.cardHolderName);

            // Format month and year to match select values
            const expirationParts = paymentMethod.expirationDate.split("/");
            const month = expirationParts[0].padStart(2, '0'); // Ensure month is 2 digits
            const year = "20" + expirationParts[1]; // Year in YYYY format

            // Set the values in the select elements
            $("#month").val(month).trigger('change');
            $("#year").val(year).trigger('change');
            $("#payment5").val(paymentMethod.securityCode);

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
                    const price = cart.product.discount_price !== null ? cart.product.discount_price : cart.product.product_price;
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


});