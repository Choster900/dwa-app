$(document).ready(function () {

    $.ajax({
        type: "GET",
        url: baseURL + "/products",
        dataType: "json",
        success: function (response) {

            const productList = $('#product-page-list');

            response.forEach(producto => {
                const promedioRating = calcularPromedioRating(producto.comments);

                const productoHTML = `
                    <div class="cus-xl-3 col-lg-6 col-md-11 col-12 mb-30 px-10"  >
                        <div class="card product product--grid">
                            <div class="h-100">
                                <div class="product-item">
                                    <div class="product-item__image">
                                        <span class="like-icon">
                                            <button type="button" class="content-center">
                                                <i class="lar la-heart icon"></i>
                                            </button>
                                        </span>
                                        <a href="product-details.html?id=${producto.product_id}"><img class="card-img-top img-fluid" src="img/digital-chair.png" alt="${producto.product_name}"></a>
                                    </div>
                                    <div class="card-body px-20 pb-25 pt-25">
                                        <div class="product-item__body text-capitalize">
                                            <a href="product-details.html?id=${producto.product_id}">
                                                <h6 class="card-title">${producto.product_name}</h6>
                                            </a>
                                            <div class="stars-rating d-flex align-items-center flex-wrap mb-10">
                                                ${generateStars(promedioRating)}
                                                <span class="stars-rating__point">${promedioRating}</span>
                                                <span class="stars-rating__review"><span>185</span> Reviews</span>
                                            </div>
                                        </div>
                                        <div class="product-item__footer">
                                            <div class="d-flex align-items-center flex-wrap">
                                                <span class="product-desc-price">$${producto.product_price.toFixed(2)}</span>
                                                <span class="product-price">$${producto.product_price.toFixed(2)}</span>
                                                <span class="product-discount">${producto.product_price}</span>
                                            </div>
                                        </div>
                                        <div class="product-item__button d-flex mt-20 flex-wrap">
                                            <button class="btn btn-default btn-squared color-light btn-outline-light px-20">
                                                <img src="img/svg/shopping-bag.svg" alt="shopping-bag" class="svg"> Add To Cart
                                            </button>
                                            <button class="btn btn-primary btn-default btn-squared border-0 px-25">buy now</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
        
                productList.append(productoHTML);
            });
        

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
        return starsHTML;
    }

    const calcularPromedioRating = (comments) => {
        if (comments.length === 0) return 0; // Si no hay comentarios, el promedio es 0

        const totalRating = comments.reduce((acc, comment) => acc + comment.rating, 0);
        return (totalRating / comments.length).toFixed(1); // Retorna el promedio con 1 decimal
    };
});