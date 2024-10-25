$(document).ready(function () {

    function getParameterByName(name) {
        const url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
        const results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    const productId = getParameterByName('id');

    $.ajax({
        type: "GET",
        url: baseURL + "/products/" + productId,
        dataType: "json",
        success: function (productResponse) {
            console.log(productResponse);

            let discountPercentage = 0;
            if (productResponse.discount_price && productResponse.discount_price < productResponse.product_price) {
                discountPercentage = ((productResponse.product_price - productResponse.discount_price) / productResponse.product_price) * 100;
                discountPercentage = discountPercentage.toFixed(0); // Redondear a número entero
            }

            $("#product_name").text(productResponse.product_name);

            $("#product_price").html(`<sub>$</sub>${productResponse.discount_price || productResponse.product_price}`);

            if (!productResponse.discount_price) {
                $("#discount_price").hide();
            } else {
                $("#discount_price").show();
                $("#discount_price").text(productResponse.product_price);
            }

            if (discountPercentage > 0) {
                $(".product-discount").text(`${discountPercentage}% Off`);
            } else {
                $(".product-discount").text("");
            }

            $("#product_description").text(productResponse.product_description);

            if (productResponse.available_stock <= 0) {
                $("#available_stock").text("Out of stock");
                $("#available_stock").css("color", "red");
            } else {
                $("#available_stock").text("In stock");

            }
            $("#amount-stock").text(productResponse.available_stock + " pieces available");

            // Obtener comentarios
            $.ajax({
                type: "GET",
                url: baseURL + "/comments?product_id=" + productId,
                dataType: "json",
                success: function (commentsResponse) {
                    const promedioRating = calcularPromedioRating(commentsResponse);
                    $("#stars-rating-detail-product").html(generateStars(promedioRating));
                },
                error: function (error) {
                    console.error("Error al obtener los comentarios:", error);
                }
            });

            // Obtener la marca
            $.ajax({
                type: "GET",
                url: baseURL + "/brands/" + productResponse.brandId,
                dataType: "json",
                success: function (response) {
                    $("#brand").html(response.brand_name);
                }
            });

            // Obtener la categoria
            $.ajax({
                type: "GET",
                url: baseURL + "/categories/" + productResponse.category_id,
                dataType: "json",
                success: function (response) {
                    $("#category").html(response.category_name);
                }
            });
        },
        error: function (error) {
            console.error("Error al obtener el producto:", error);
        }
    });



    function generateStars(rating) {
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                starsHTML += '<span class="star-icon las la-star active"></span>';
            } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
                starsHTML += '<span class="star-icon las la-star-half-alt active"></span>';
            } else {
                starsHTML += '<span class="star-icon las la-star"></span>';
            }
        }
        starsHTML += `<span class="stars-rating__point">${rating}</span>
                        <span class="stars-rating__review">
                        <span>778</span> Reviews</span>
                        `
        return starsHTML;
    }

    const calcularPromedioRating = (comments) => {
        if (comments.length === 0) return 0;

        const totalRating = comments.reduce((acc, comment) => acc + comment.rating, 0);
        return (totalRating / comments.length).toFixed(1);
    };


    $("#btn-buy").click(function (e) {
        e.preventDefault();
    
        // Obtener la cantidad actual del producto
        const quantity = parseInt($(".current-quantity").val());
        const productId = getParameterByName('id'); // Asumiendo que tienes esta función para obtener el id del producto
        const userId = 1; // Cambiar según el usuario actual
       // const baseURL = "URL_DE_TU_API"; // Reemplaza con la URL base de tu API
    
        $.ajax({
            type: "GET",
            url: `${baseURL}/shopping_cart?isSelled=false&userId=${userId}&productId=${productId}`,
            dataType: "json",
            success: function (response) {
                if (response.length > 0) {
                    // Si el producto ya está en el carrito, actualizar la cantidad
                    const cartItemId = response[0].id;
                    const updatedQuantity = response[0].quantity + quantity;
    
                    $.ajax({
                        type: "PATCH",
                        url: `${baseURL}/shopping_cart/${cartItemId}`,
                        data: JSON.stringify({
                            quantity: updatedQuantity,
                            updated_at: new Date().toISOString()
                        }),
                        contentType: "application/json",
                        success: function (updateResponse) {
                            console.log("Carrito actualizado:", updateResponse);
                        },
                        error: function (error) {
                            console.error("Error al actualizar el carrito:", error);
                        }
                    });
                } else {
                    // Si no está en el carrito, agregarlo como un nuevo registro
                    const data = {
                        quantity: quantity,
                        userId: userId,
                        productId: productId,
                        isSelled: false,
                        added_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
    
                    $.ajax({
                        type: "POST",
                        url: `${baseURL}/shopping_cart`,
                        data: JSON.stringify(data),
                        contentType: "application/json",
                        success: function (addResponse) {
                            console.log("Producto agregado al carrito:", addResponse);
                        },
                        error: function (error) {
                            console.error("Error al agregar el producto al carrito:", error);
                        }
                    });
                }
            },
            error: function (error) {
                console.error("Error al verificar el carrito:", error);
            }
        });
    });
    


});