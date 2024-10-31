function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

$(document).ready(function () {

    const userId = getCookie('userId');


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
                //$('#subtotal-value').text(`$${totPrice.toFixed(2)}`);
                $(".subtotalTotal>span").text(`$${totPrice.toFixed(2)}`);

                const descuento = coupon.descuento ? totPrice * coupon.descuento : totPrice;
                const shippingCost = response[0].centralAmericaCountrie.average_shipping_cost;

                if (coupon.descuento) {
                    $("#discount-price").text(`- $${(descuento).toFixed(2)}`);
                    $("#discount-div").show(); // Asegúrate de mostrar el div del descuento
                    $("#percent-discount").text(parseFloat(coupon.descuento) * 100 + "% OFF");
                    $("#coupon-code").val(coupon.codigo);
                    //  $("#shipping-charge").text("$" + shippingCost.toFixed(2));
                    $(".shipping>span").text("$" + shippingCost.toFixed(2));
                    $("#total-total").text("$" + (parseFloat(totPrice) - parseFloat(descuento) + parseFloat(shippingCost)).toFixed(2));
                    $("#total-table").text("$" + (parseFloat(totPrice) + parseFloat(shippingCost)).toFixed(2));
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


    // Cargar el carrito inicialmente
    $.ajax({
        type: "GET",
        url: baseURL + "/shopping_cart?_embed=product&isSelled=false&userId=" + userId,
        dataType: "json",
        success: function (response) {
            console.log(response);

            try {
                if (response.length === 0) {
                    $("#cart >tbody").html(`
                        <tr>
                            <td colspan="5" class="text-center">No hay productos en tu carrito.</td>
                        </tr>
                    `);
                    return;
                }

                calcularTotalCompra(response);

                const cartItemsHTML = response.map(cartItem => {
                    const { product, id } = cartItem;
                    const { product_name, product_price, discount_price } = product;

                    let discountPercentage = 0;
                    if (discount_price && discount_price < product_price) {
                        discountPercentage = ((product_price - discount_price) / product_price) * 100;
                        discountPercentage = discountPercentage.toFixed(0); // Redondear a número entero
                    }

                    const quantity = cartItem.quantity || 1;

                    return `
                        <tr id="row-${id}" data-product-id="${id}">
                            <td class="Product-cart-title">
                                <div class="media align-items-center">
                                    <img class="me-3 wh-80 align-self-center radius-xl" src="img/cart1.png" alt="${product_name}">
                                    <div class="media-body">
                                        <h5 class="mt-0">${product_name}</h5>
                                        <div class="d-flex">
                                            <p>Size: <span>large</span></p>
                                            <p>Color: <span>brown</span></p>
                                        </div>

                                    </div>
                                </div>
                            </td>
                           <td class="price">
                                <div class="d-flex flex-column">
                                    <span class="product-price" id="discount_price" style="font-size: 0.9rem; font-weight: bold; color: #8231d3;">
                                        $${discount_price ? discount_price.toFixed(2) : product_price.toFixed(2)}
                                    </span>
                                    ${discount_price ? `
                                        <div class="d-flex align-items-center">
                                            <span class="product-desc-price text-muted" style="text-decoration: line-through; font-size: 0.9rem;">
                                                $${product_price.toFixed(2)}
                                            </span>
                                            <span class="product-discount ms-2" style="font-size: 0.75rem; color: #5840ff">
                                                ${discountPercentage}% Off
                                            </span>
                                        </div>
                                    ` : ''}
                                </div>
                            </td>

                            <td>
                                <div class="quantity product-cart__quantity">
                                    <input type="button" value="-" class="qty-minus bttn bttn-left wh-36" data-product-id="${id}" data-product-price="${discount_price ? discount_price.toFixed(2) : product_price.toFixed(2)}">
                                    <input type="number" value="${quantity}" class="qty qh-36 input" data-product-id="${id}" min="1">
                                    <input type="button" value="+" class="qty-plus bttn bttn-right wh-36" data-product-id="${id}" data-product-price="${discount_price ? discount_price.toFixed(2) : product_price.toFixed(2)}">
                                </div>
                            </td>
                            <td class="text-center subtotal" id="subtotal-${id}">$${(discount_price ? discount_price * quantity : product_price * quantity).toFixed(2)} </td>
                        </tr>
                    `;
                }).join("");

                $("#cart >tbody").html(cartItemsHTML);

                // Recalcular total inicial
                //recalcularTotal();

            } catch (error) {
                console.error("Error al procesar los productos del carrito:", error);
                $("#cart >tbody").html(`
                    <tr>
                        <td colspan="5" class="text-center">Hubo un error al cargar el carrito.</td>
                    </tr>
                `);
            }
        },
        error: function (error) {
            console.error("Error al obtener el carrito:", error);
            $("#cart >tbody").html(`
                <tr>
                    <td colspan="5" class="text-center">No se pudo cargar el carrito.</td>
                </tr>
            `);
        }
    });

    function recalcularTotal() {
        let total = 0;
        $(".subtotal").each(function () {
            const subtotal = parseFloat($(this).text().replace('$', ''));
            total += subtotal;
        });
        $("#total-cart").text(`$${total.toFixed(2)}`);
    }

    function actualizarCarrito(cartItemId, nuevaCantidad) {

        $.ajax({
            type: "PATCH",
            url: `${baseURL}/shopping_cart/${cartItemId}`,
            contentType: "application/json",
            data: JSON.stringify({
                quantity: nuevaCantidad,
                updated_at: new Date().toISOString()
            }),
            success: function (response) {
                console.log("Carrito actualizado:", response);

                $.ajax({
                    type: "GET",
                    url: baseURL + "/shopping_cart?_embed=product&isSelled=false&userId=" + userId,
                    dataType: "json",
                    success: function (response) {
                        calcularTotalCompra(response);
                    }
                });
            },
            error: function (error) {
                console.error("Error al actualizar el carrito:", error);
            }
        });
    }


    function actualizarSubtotal(cartItemId, nuevaCantidad, productPrice) {
        const subtotal = (nuevaCantidad * productPrice).toFixed(2);
        $(`#subtotal-${cartItemId}`).text(`$${subtotal}`);
        recalcularTotal();
    }

    // Click para aumentar uno en los productos
    $(document).on('click', '.qty-plus', function (event) {
        event.preventDefault();

        const cartItemId = $(this).data('product-id');
        const productPrice = $(this).data('product-price');

        actualizarSubtotal(cartItemId, parseInt($(this).siblings('.input').val()) + 1, productPrice);
        actualizarCarrito(cartItemId, parseInt($(this).siblings('.input').val()) + 1)


    });

    // Click para disminuir uno en los productos
    $(document).on('click', '.qty-minus', function () {
        const cartItemId = $(this).data('product-id');
        const productPrice = $(this).data('product-price');
        const $quantityInput = $(this).siblings('.input');

        actualizarSubtotal(cartItemId, parseInt($(this).siblings('.input').val()) - 1, productPrice);


        if ((parseInt($(this).siblings('.input').val()) - 1) === 0) {
            $('#modal-info-confirmed').modal({
                backdrop: 'static',
                keyboard: false
            }).modal('show');

            $('#modal-info-confirmed').modal('show');


            $('#modal-info-confirmed .btn-info').off('click').on('click', function () {
                $('#modal-info-confirmed').modal('hide');
                eliminarDelCarrito(cartItemId);
                $(`tr[data-product-id="${cartItemId}"]`).remove();
            });

            $('#modal-info-confirmed .btn-light').off('click').on('click', function () {
                $quantityInput.val(1);
                actualizarSubtotal(cartItemId, 1, productPrice);
                $('#modal-info-confirmed').modal('hide');
            });

        } else {

            actualizarCarrito(cartItemId, parseInt($(this).siblings('.input').val()) - 1)
        }
    });

    $(document).on('change', '.input', function () {
        const cartItemId = $(this).data('product-id');
        const productPrice = $(this).siblings('.qty-plus').data('product-price');
        let quantity = parseInt($(this).val());

        if (quantity <= 0) {

            $('#modal-info-error').modal('show');
            quantity = 1;
            $(this).val(quantity);
        }

        actualizarSubtotal(cartItemId, quantity, productPrice);
        actualizarCarrito(cartItemId, quantity);
    });
});