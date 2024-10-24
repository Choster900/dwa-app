$(document).ready(function () {
    const productList = $('#product-page-list');

    // Obtener productos
    $.ajax({
        type: "GET",
        url: baseURL + "/products",
        dataType: "json",
        success: function (products) {
            products.forEach(product => {
                const { id, product_name, product_price, discount_price } = product;

                // Obtener comentarios por productos
                $.ajax({
                    type: "GET",
                    url: baseURL + "/comments?product_id=" + id,
                    dataType: "json",
                    success: function (comments) {
                        const promedioRating = calcularPromedioRating(comments);
                        productList.append(crearProductoHTML({ id, product_name, product_price, promedioRating, discount_price }));
                    },
                    error: function (error) {
                        console.error("Error al obtener comentarios:", error);
                        productList.append(crearProductoHTML({ id, product_name, product_price, promedioRating: null, discount_price }));
                    }
                });
            });
        },
        error: function (error) {
            console.error("Error al obtener productos:", error);
        }
    });

    function crearProductoHTML({ id, product_name, product_price, promedioRating, discount_price }) {
        let discountPercentage = 0;
        if (discount_price && discount_price < product_price) {
            discountPercentage = ((product_price - discount_price) / product_price) * 100;
            discountPercentage = discountPercentage.toFixed(0); // Redondear a número entero
        }

        let finalPrice = discount_price ? discount_price : product_price;

        return `
            <div class="cus-xl-3 col-lg-6 col-md-11 col-12 mb-30 px-10">
                <div class="card product product--grid">
                    <div class="h-100">
                        <div class="product-item">
                            <div class="product-item__image">
                                <span class="like-icon">
                                    <button type="button" class="content-center">
                                        <i class="lar la-heart icon"></i>
                                    </button>
                                </span>
                                <a href="product-details.html?id=${id}">
                                    <img class="card-img-top img-fluid" src="img/digital-chair.png" alt="${product_name}">
                                </a>
                            </div>
                            <div class="card-body px-20 pb-25 pt-25">
                                <div class="product-item__body text-capitalize">
                                    <a href="product-details.html?id=${id}">
                                        <h6 class="card-title">${product_name}</h6>
                                    </a>
                                    <div class="stars-rating d-flex align-items-center flex-wrap mb-10">
                                        ${generateStars(promedioRating)}
                                        <span class="stars-rating__point">${promedioRating || 'N/A'}</span>
                                        <span class="stars-rating__review"><span>185</span> Reviews</span>
                                    </div>
                                </div>
                                <div class="product-item__footer">
                                    <div class="d-flex align-items-center flex-wrap">
                                        <span class="product-desc-price">$${finalPrice.toFixed(2)}</span>
                                        ${discount_price ? `
                                            <span class="product-price text-muted" style="text-decoration: line-through;">$${product_price.toFixed(2)}</span>
                                            <span class="product-discount">${discountPercentage}% Off</span>
                                        ` : ''}
                                    </div>
                                </div>
                                <div class="product-item__button d-flex mt-20 flex-wrap">
                                    <button class="btn btn-default btn-squared color-light btn-outline-light px-20">
                                        <img src="img/svg/shopping-bag.svg" alt="shopping-bag" class="svg"> Add To Cart
                                    </button>
                                    <button class="btn btn-primary btn-default btn-squared border-0 px-25">Buy Now</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function generateStars(rating) {
        return Array.from({ length: 5 }, (_, i) => {
            if (i < Math.floor(rating)) {
                return '<span class="star-icon las la-star active"></span>';
            } else if (i === Math.floor(rating) && rating % 1 !== 0) {
                return '<span class="star-icon las la-star-half-alt active"></span>';
            } else {
                return '<span class="star-icon las la-star"></span>';
            }
        }).join('');
    }

    function calcularPromedioRating(comments) {
        if (!comments.length) return 0;
        const totalRating = comments.reduce((acc, { rating }) => acc + rating, 0);
        return (totalRating / comments.length).toFixed(1);
    }
});
