function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

$(document).ready(function () {
    const userId = getCookie('userId');

    $.ajax({
        type: 'GET',
        url: `${baseURL}/products?_embed=brand&userId=${userId}`, // URL para obtener productos con marca y categoría
        dataType: 'json',
        success: function (products) {
            const tbody = $('.table tbody'); // Selector para el <tbody> de la tabla
            tbody.empty(); // Limpiar el contenido anterior

            if (products.length === 0) {
                // Si no hay productos, mostrar un mensaje
                const noProductsMessage = `
                    <tr>
                        <td colspan="7" class="text-center">
                            <div class="userDatatable-content">
                                <p>No products available.</p>
                            </div>
                        </td>
                    </tr>
                `;
                tbody.append(noProductsMessage); // Agregar mensaje de no productos
            } else {
                // Si hay productos, llenar la tabla
                products.forEach(product => {
                    const productRow = `
                        <tr>
                            <td>
                                <div class="d-flex">
                                    <div class="userDatatable__imgWrapper d-flex align-items-center">
                                        <div class="checkbox-group-wrapper">
                                            <div class="checkbox-group d-flex">
                                                <div class="checkbox-theme-default custom-checkbox checkbox-group__single d-flex">
                                                    <input class="checkbox" type="checkbox" id="check-prod-${product.id}">
                                                    <label for="check-prod-${product.id}"></label>
                                                </div>
                                            </div>
                                        </div>
                                        <a href="#" class="profile-image rounded-circle d-block m-0 wh-38" style="background-image:url('${product.image_url}'); background-size: cover;"></a>
                                    </div>
                                    <div class="userDatatable-inline-title">
                                        <a href="#" class="text-dark fw-500">
                                            <h6>${product.product_name}</h6>
                                        </a>
                                        <p class="d-block mb-0">
                                             ${product.brand ? product.brand.brand_name : 'N/A'} 
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div class="userDatatable-content">
                                    ${product.category ? product.category.category_name : 'N/A'} <!-- Nombre de la categoría -->
                                </div>
                            </td>
                            <td>
                                <div class="userDatatable-content">
                                    ${product.product_price.toFixed(2)}  <!-- Precio original -->
                                </div>
                            </td>
                            <td>
                                <div class="userDatatable-content">
                                    ${product.discount_price ? product.discount_price.toFixed(2) : 'N/A'} <!-- Precio con descuento -->
                                </div>
                            </td>
                            <td>
                                <div class="userDatatable-content">
                                    ${product.created_at}
                                </div>
                            </td>
                            <td>
                                <div class="userDatatable-content d-inline-block">
                                    <span class="bg-opacity-success color-success rounded-pill userDatatable-content-status active">${product.status}</span>
                                </div>
                            </td>
                            <td>
                                <ul class="orderDatatable_actions mb-0 d-flex flex-wrap" >
                                    <li>
                                        <a href="#" class="view" data-id="${product.id}">
                                            <i class="uil uil-eye"></i>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="./product.html?productId=${product.id}"" class="edit" data-id="${product.id}">
                                            <i class="uil uil-edit"></i>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" class="remove" data-id="${product.id}">
                                            <i class="uil uil-trash-alt"></i>
                                        </a>
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    `;
                    tbody.append(productRow); // Agregar la fila del producto al tbody
                });
            }
        },
        error: function () {
            console.error('Error al cargar los productos');
        }
    });
});
