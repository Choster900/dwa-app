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

    // Obtener el 'id' del producto desde la URL
    const productId = getParameterByName('id');

    console.log(productId);

    $.ajax({
        type: "GET",
        url: baseURL + "/products/" + productId,
        dataType: "json",
        success: function (productResponse) {
            console.log(productResponse);
    
            // Calcular el porcentaje de descuento si el precio de descuento existe
            let discountPercentage = 0;
            if (productResponse.discount_price && productResponse.discount_price < productResponse.product_price) {
                discountPercentage = ((productResponse.product_price - productResponse.discount_price) / productResponse.product_price) * 100;
                discountPercentage = discountPercentage.toFixed(0); // Redondear a número entero
            }
    
            // Actualizar el nombre del producto
            $("#product_name").text(productResponse.product_name);
    
            // Actualizar el precio con descuento si existe, si no, mostrar el precio original
            $("#product_price").html(`<sub>$</sub>${productResponse.discount_price || productResponse.product_price}`);
    
            // Si no hay descuento, oculta el precio original y el porcentaje
            if (!productResponse.discount_price) {
                $("#discount_price").hide(); // Si no hay descuento, ocultar el precio original
            } else {
                $("#discount_price").show(); // Mostrar el precio original si existe descuento
                $("#discount_price").text(productResponse.product_price); // Mostrar el precio original
            }
    
            // Mostrar el porcentaje de descuento si existe
            if (discountPercentage > 0) {
                $(".product-discount").text(`${discountPercentage}% Off`);
            } else {
                $(".product-discount").text(""); // Si no hay descuento, ocultar
            }
    
            // Actualizar la descripción del producto
            $("#product_description").text(productResponse.product_description);
    
            // Actualizar la disponibilidad del stock
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
                url: baseURL + "/brands/" + productResponse.brand_id,
                dataType: "json",
                success: function (response) {
                    $("#brand").html(response.brand_name);
                }
            });


            $.ajax({
                type: "GET",
                url: baseURL + "/categories/" + productResponse.category_id,
                dataType: "json",
                success: function (response) {
                    $("#category").html(response.response.category_name);
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

});