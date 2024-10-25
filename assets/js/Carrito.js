$(document).ready(function () {

    function actualizarSubtotal(cartItemId, nuevaCantidad, productPrice) {
        const subtotal = (nuevaCantidad * productPrice).toFixed(2);
        $(`#subtotal-${cartItemId}`).text(`$${subtotal}`);
        recalcularTotal();
    }

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
            },
            error: function (error) {
                console.error("Error al actualizar el carrito:", error);
            }
        });
    }

    // Cargar el carrito inicialmente
    $.ajax({
        type: "GET",
        url: baseURL + "/shopping_cart?_embed=product&isSelled=false&userId=1", // TODO: Ponerle el id usuario que corresponde
        dataType: "json",
        success: function (response) {
            try {
                if (response.length === 0) {
                    $("#cart >tbody").html(`
                        <tr>
                            <td colspan="5" class="text-center">No hay productos en tu carrito.</td>
                        </tr>
                    `);
                    return;
                }

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
                        <tr id="row-${id}">
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
                            <td class="actions">
                                <button type="button" class="action-btn float-end" data-product-id="${id}">
                                    <i class="las la-trash-alt"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join("");

                $("#cart >tbody").html(cartItemsHTML);

                // Recalcular total inicial
                recalcularTotal();

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

    // Evento para incrementar la cantidad
    $(document).on('click', '.qty-plus', function (event) {
        event.preventDefault(); // Evitar recarga de página si está dentro de un formulario o botón submit

        const cartItemId = $(this).data('product-id');
        const productPrice = $(this).data('product-price');
        console.log(productPrice);

        // Actualizar subtotal
        actualizarSubtotal(cartItemId, parseInt($(this).siblings('.input').val()) + 1, productPrice);
        actualizarCarrito(cartItemId, parseInt($(this).siblings('.input').val()) + 1)
    });


    // Evento para disminuir la cantidad
    $(document).on('click', '.qty-minus', function () {
        const cartItemId = $(this).data('product-id');
        const productPrice = $(this).data('product-price');


        actualizarSubtotal(cartItemId, parseInt($(this).siblings('.input').val()) - 1, productPrice);
         actualizarCarrito(cartItemId, parseInt($(this).siblings('.input').val()) - 1)

        /* 
        console.log(parseInt($(this).siblings('.input').val()) - 1);

        if ((parseInt($(this).siblings('.input').val()) - 1) === 0) {
            // Pregunta al usuario si desea eliminar el artículo

            $('#modal-info-confirmed').modal('show');

            //  alert("se elimina")

            $('#modal-info-confirmed .btn-info').off('click').on('click', function () {
                parseInt($(this).siblings('.input').val()) + 1
                $('#modal-info-confirmed').modal('hide'); // Oculta el modal después de la acción
            });

            // Si hace clic en "Cancel", restablece la cantidad a 1
            $('#modal-info-confirmed .btn-light').off('click').on('click', function () {
                $('#modal-info-confirmed').modal('hide'); // Oculta el modal sin eliminar el artículo
            });

        } else {
            // Actualizar el subtotal y la cantidad si no es 0
            console.log("continua disminuyendo" + parseInt($(this).siblings('.input').val()));

        } */
    });

    // Evento para actualizar cantidad al cambiar manualmente el input
    $(document).on('change', '.input', function () {

        const cartItemId = $(this).data('product-id');
        const productPrice = $(this).siblings('.qty-plus').data('product-price');

        actualizarSubtotal(cartItemId, parseInt($(this).val()), productPrice);
        actualizarCarrito(cartItemId, parseInt($(this).val()))

    });

});
