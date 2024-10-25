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
                            <td class="actions">
                                <button type="button"  class="action-btn btn-delete float-end" data-product-id="${id}">
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

    // Click para aumentar uno en los productos
    $(document).on('click', '.qty-plus', function (event) {
        event.preventDefault();

        const cartItemId = $(this).data('product-id');
        const productPrice = $(this).data('product-price');
        console.log(productPrice);

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


    $(document).on('click', '.btn-delete', function (e) {
        const cartItemId = $(this).data('product-id');

        $('#modal-info-confirmed').modal('show');

        $('#modal-info-confirmed .btn-info').off('click').on('click', function () {
            eliminarDelCarrito(cartItemId); // Llama a la función para eliminar el producto
            $(`tr[data-product-id="${cartItemId}"]`).remove();

            $('#modal-info-confirmed').modal('hide'); // Cierra el modal
        });

        $('#modal-info-confirmed .btn-light').off('click').on('click', function () {
            $('#modal-info-confirmed').modal('hide'); // Cierra el modal sin eliminar
        });
    });



    function eliminarDelCarrito(cartItemId) {
        $.ajax({
            type: "DELETE",
            url: `${baseURL}/shopping_cart/${cartItemId}`,
            success: function (response) {
                console.log("Artículo eliminado del carrito:", response);
            },
            error: function (error) {
                console.error("Error al eliminar el artículo:", error);
            }
        });
    }

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
