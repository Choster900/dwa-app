$(document).ready(function () {
    const productList = $('#product-page-list');

    // Obtener productos
    function obtenerProductosFiltradosPorPrecio(minPrecio, maxPrecio) {
        $.ajax({
            type: "GET",
            url: baseURL + "/products?status=published",
            dataType: "json",
            success: function (products) {
                // Limpiar lista de productos antes de mostrar los nuevos
                productList.empty();

                products.forEach(product => {
                    const { id, product_name, product_price, discount_price } = product;
                    const finalPrice = discount_price || product_price;

                    // Filtrar productos dentro del rango de precio
                    if (finalPrice >= minPrecio && finalPrice <= maxPrecio) {
                        // Obtener comentarios por producto
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
                    }
                });
            },
            error: function (error) {
                console.error("Error al obtener productos:", error);
            }
        });
    }

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


    // Asignar el evento de cambio con MutationObserver para detectar cambios en el texto
    let debounceTimer;

    // Asignar el evento de cambio con MutationObserver para detectar cambios en el texto
    const priceObserver = new MutationObserver(() => {
        // Limpiar el temporizador anterior si hay cambios
        clearTimeout(debounceTimer);
        // Establecer un nuevo temporizador para ejecutar la función después de un tiempo (500ms)
        debounceTimer = setTimeout(detectarCambioRangoPrecio, 500);
    }); priceObserver.observe(document.querySelector(".price-value"), { childList: true });

    // Para probar manualmente, cambia el texto de price-value
    $(".price-value").on("input", detectarCambioRangoPrecio);


    // Función para detectar cambios en el rango de precio
    function detectarCambioRangoPrecio() {
        const precioText = $(".price-value").text().trim();
        const precios = precioText.match(/\d+/g); // Extraer los números
        if (precios && precios.length === 2) {
            const minPrecio = parseFloat(precios[0]);
            const maxPrecio = parseFloat(precios[1]);
            console.log("Rango de precio detectado:", minPrecio, "-", maxPrecio);
            obtenerProductosFiltradosPorPrecio(minPrecio, maxPrecio);
        }
    }

    $(document).ready(function () {
        const baseURL = "http://localhost:3000"; // Cambia esto a la URL de tu JSON Server
        const categoryList = $(".product-category ul"); // Contenedor de categorías en el HTML

        // Función para obtener y mostrar las categorías
        function obtenerCategorias() {
            $.ajax({
                type: "GET",
                url: baseURL + "/categories",
                dataType: "json",
                success: function (categories) {
                    categoryList.empty(); // Limpiar la lista antes de agregar las categorías

                    categories.forEach(category => {
                        const { category_name } = category;

                        // Agregar cada categoría a la lista con un formato HTML
                        const categoryItem = `
                            <li>
                                <div class="w-100">
                                    <span role="button" class="fs-14 color-gray">${category_name}<span class="item-numbers"></span></span>
                                </div>
                            </li>`;

                        categoryList.append(categoryItem);
                    });
                },
                error: function (error) {
                    console.error("Error al obtener categorías:", error);
                }
            });
        }

        obtenerCategorias(); // Llamar a la función para cargar las categorías
    });

    const brandList = $(".product-brands ul"); // Contenedor de marcas en el HTML

    // Función para obtener y mostrar las marcas
    function obtenerMarcas() {
        $.ajax({
            type: "GET",
            url: baseURL + "/brands",
            dataType: "json",
            success: function (brands) {
                brandList.empty(); // Limpiar la lista antes de agregar las marcas

                brands.forEach((brand, index) => {
                    const { id, brand_name } = brand;

                    // Agregar cada marca con un checkbox y un identificador único
                    const brandItem = `
                        <li>
                            <div class="checkbox-theme-default custom-checkbox">
                                <input class="checkbox" type="checkbox" id="brand-${id}" data-brand-id="${id}">
                                <label for="brand-${id}">
                                    <span class="checkbox-text">
                                        ${brand_name}
                                        <span class="item-numbers"></span>
                                    </span>
                                </label>
                            </div>
                        </li>`;

                    brandList.append(brandItem);
                });

                // Agregar evento de cambio para cada checkbox de marca
                $(".checkbox").change(function () {
                    const marcasSeleccionadas = $(".checkbox:checked").map(function () {
                        return $(this).data("brand-id");
                    }).get();

                    filtrarProductosPorMarca(marcasSeleccionadas); // Filtrar productos por marcas seleccionadas
                });
            },
            error: function (error) {
                console.error("Error al obtener marcas:", error);
            }
        });
    }
    obtenerMarcas()

    const searchForm = $('.shop-search form'); // Selecciona el formulario de búsqueda
    const searchInput = $('.shop-search input[type="search"]'); // Selecciona el campo de búsqueda

    // Detectar el envío del formulario y actualizar los productos
    searchForm.on("submit", function (e) {
        e.preventDefault(); // Evita que el formulario recargue la página
        const searchValue = searchInput.val().trim(); // Obtener el valor del campo de búsqueda
        console.log(searchValue);
        
        //obtenerProductosFiltradosPorNombre(searchValue);
    });

});
