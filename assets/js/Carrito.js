$(document).ready(function () {

    function actualizarSubtotal(productId, nuevaCantidad, productPrice) {
        const subtotal = (nuevaCantidad * productPrice).toFixed(2);
        $(`#subtotal-${productId}`).text(`$${subtotal}`);
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

    function actualizarCarrito(productId, nuevaCantidad) {

        $.ajax({
            type: "PUT",
            url: `${baseURL}/shopping_cart/${productId}`,
            contentType: "application/json",
            data: JSON.stringify({
                quantity: nuevaCantidad,
                userId: "1", // TODO: Poner el id que corresponde
                productId: productId.toString(),
                isSelled: false,
                added_at: "2024-10-24T14:30:00Z",
                updated_at: "2024-10-24T14:30:00Z"
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

                const cartItemsHTML = response.map(cartItem => {
                    const { product } = cartItem;
                    console.log(product);
                    const { id: productId, product_name, product_price, discount_price } = product;

                    let discountPercentage = 0;
                    if (discount_price && discount_price < product_price) {
                        discountPercentage = ((product_price - discount_price) / product_price) * 100;
                        discountPercentage = discountPercentage.toFixed(0); // Redondear a número entero
                    }

                    const quantity = cartItem.quantity || 1;

                    return `
                        <tr id="row-${productId}">
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
                                    <input type="button" value="-" class="qty-minus bttn bttn-left wh-36" data-product-id="${productId}" data-product-price="${discount_price ? discount_price.toFixed(2) : product_price.toFixed(2)}">
                                    <input type="number" value="${quantity}" class="qty qh-36 input" data-product-id="${productId}" min="1">
                                    <input type="button" value="+" class="qty-plus bttn bttn-right wh-36" data-product-id="${productId}" data-product-price="${discount_price ? discount_price.toFixed(2) : product_price.toFixed(2)}">
                                </div>
                            </td>
                            <td class="text-center subtotal" id="subtotal-${productId}">$${(discount_price ? discount_price : product_price.toFixed(2) * quantity).toFixed(2)}</td>
                            <td class="actions">
                                <button type="button" class="action-btn float-end" data-product-id="${productId}">
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

        const productId = $(this).data('product-id');
        const productPrice = $(this).data('product-price');
        console.log(productPrice);
        
        // Actualizar subtotal
        actualizarSubtotal(productId, parseInt($(this).siblings('.input').val()) + 1, productPrice);
        actualizarCarrito(productId, parseInt($(this).siblings('.input').val()) + 1)
    });


    // Evento para disminuir la cantidad
    $(document).on('click', '.qty-minus', function () {
        const productId = $(this).data('product-id');
        const productPrice = $(this).data('product-price');

        // if (parseInt($(this).siblings('.input').val()) < 1) parseInt($(this).siblings('.input').val())  = 1;

        actualizarSubtotal(productId, parseInt($(this).siblings('.input').val()) - 1, productPrice);
        actualizarCarrito(productId, parseInt($(this).siblings('.input').val()) - 1)

    });

    // Evento para actualizar cantidad al cambiar manualmente el input
    $(document).on('change', '.input', function () {

        const productId = $(this).data('product-id');
        const productPrice = $(this).siblings('.qty-plus').data('product-price');


        actualizarSubtotal(productId, parseInt($(this).val()), productPrice);
        $.ajax({
            type: "PUT",
            url: `${baseURL}/shopping_cart/${productId}`,
            contentType: "application/json",
            data: JSON.stringify({
                quantity: parseInt($(this).val()),
                userId: "1", // TODO: Poner el id que corresponde
                productId: productId.toString(),
                added_at: "2024-10-24T14:30:00Z",
                updated_at: "2024-10-24T14:30:00Z"
            }),
            success: function (response) {
                console.log("Carrito actualizado:", response);
            },
            error: function (error) {
                console.error("Error al actualizar el carrito:", error);
            }
        });
    });

});
