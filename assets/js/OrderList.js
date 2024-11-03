// Función para obtener el valor de una cookie
function getCookie(name) {
    const cookieMatch = document.cookie.match(`(^|;\\s*)(${name})=([^;]*)`);
    return cookieMatch ? decodeURIComponent(cookieMatch[3]) : null;
}

// Función para cargar los estados de las facturas
const loadInvoiceStatuses = async () => {
    try {
        const statuses = await $.ajax({
            type: 'GET',
            url: `${baseURL}/invoiceStatuses`,
            dataType: 'json'
        });

        const statusContainer = $('#ap-tab');
        statusContainer.empty();  // Limpia los elementos anteriores

        // Agrega el elemento "All" primero
        statusContainer.append(createStatusTab('All', 'ap-overview', true));

        // Recorre cada estado y crea un elemento de navegación
        statuses.forEach(status => {
            statusContainer.append(createStatusTab(status.nombre, status.nombre.toLowerCase()));
        });
    } catch (error) {
        console.error('Error al cargar los estados de las facturas:', error);
    }
};

// Función para crear un elemento de estado
const createStatusTab = (name, id, isActive = false) => `
    <li class="nav-item">
        <a class="nav-link ${isActive ? 'active' : ''}" id="${id}-tab" data-bs-toggle="pill" href="#${id}" role="tab" aria-selected="${isActive}">${name.charAt(0).toUpperCase() + name.slice(1)}</a>
    </li>
`;

// Función para cargar productos de las facturas del usuario
const loadUserProductsFromInvoices = async () => {
    const userId = getCookie('userId');

    try {
        const invoices = await $.ajax({
            type: 'GET',
            url: `${baseURL}/invoices?_embed=invoiceStatuse&_embed=user`,
            dataType: 'json'
        });

        const tbody = $('.table tbody');
        tbody.empty();  // Limpiar contenido anterior

        if (invoices.length === 0) {
            tbody.append(createNoDataMessage('No invoices found.'));
            return;
        }

        const productRequests = [];

        invoices.forEach(invoice => {
            invoice.products.forEach(product => {
                // Hacer una solicitud para obtener los detalles del producto
                const productRequest = fetchProductDetails(product.productId, userId, invoice);
                if (productRequest) {
                    productRequests.push(productRequest);
                }
            });
        });

        // Esperar a que se resuelvan todas las solicitudes de productos
        const productDetailsArray = await Promise.all(productRequests);
        productDetailsArray.forEach(productRow => {
            if (productRow) tbody.append(productRow);
        });

        // Si no hay productos del usuario, mostrar mensaje
        if (productDetailsArray.length === 0) {
            tbody.append(createNoDataMessage('No products found for this user in invoices.'));
        }
    } catch (error) {
        console.error('Error al cargar las facturas:', error);
    }
};

// Función para obtener los detalles del producto
const fetchProductDetails = async (productId, userId, invoice) => {
    try {
        const productDetails = await $.ajax({
            type: 'GET',
            url: `${baseURL}/products/${productId}`,
            dataType: 'json'
        });

        // Verificar si el producto pertenece al usuario actual
        if (productDetails.userId !== userId) {
            return null;  // Si no es del usuario actual, no crear la fila
        }

        console.log(invoice);

        return createProductRow(productDetails, invoice);
    } catch (error) {
        console.error(`Error al obtener el producto ${productId}:`, error);
        return null;  // Devuelve null en caso de error
    }
};

// Función para crear una fila de producto
const createProductRow = (productDetails, invoice) => {
    // Obtener el producto de la factura
    const product = invoice.products.find(p => p.productId === productDetails.id);
    const totalPrice = (product.price_per_unit * product.quantity).toFixed(2); // Calcular el precio total
    const unitPrice = product.price_per_unit.toFixed(2); // Precio unitario
    const quantity = product.quantity; // Cantidad solicitada

    return `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <div class="me-3 d-flex align-items-center">
                        <div class="checkbox-group-wrapper">
                            <div class="checkbox-group d-flex">
                                <div class="checkbox-theme-default custom-checkbox checkbox-group__single d-flex">
                                    <input class="checkbox" type="checkbox" id="check-prod-${productDetails.id}">
                                    <label for="check-prod-${productDetails.id}"></label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="orderDatatable-title">
                        <p class="d-block mb-0">${productDetails.product_name}</p>
                    </div>
                </div>
            </td>
            <td>
                <div class="orderDatatable-title">${invoice.user.name || 'Unknown Customer'}</div>
            </td>
            <td>
                <div class="orderDatatable-status d-inline-block">
                    <span class="order-bg-opacity-${getStatusClass(invoice.invoiceStatuse.nombre)} text-success rounded-pill active">
                        ${invoice.invoiceStatuse.nombre || 'Unknown'}
                    </span>
                </div>
            </td>
            <td>
                <div class="orderDatatable-title">$${totalPrice}</div> <!-- Muestra el precio total calculado -->
            </td>
            <td>
                <div class="orderDatatable-title">${quantity}</div> <!-- Cantidad solicitada -->
            </td>
            <td>
                <div class="orderDatatable-title">$${unitPrice}</div> <!-- Precio unitario -->
            </td>
            <td>
                <div class="orderDatatable-title float-end">${new Date(invoice.created_at).toLocaleDateString()}</div>
            </td>
            <td>
                <ul class="orderDatatable_actions mb-0 d-flex flex-wrap float-end">
                    <li><a href="#" class="view"><i class="uil uil-eye"></i></a></li>
                    <li><a href="#" class="edit"><i class="uil uil-edit"></i></a></li>
                    <li><a href="#" class="remove"><i class="uil uil-trash-alt"></i></a></li>
                </ul>
            </td>
        </tr>
    `;
};



// Función para mostrar un mensaje cuando no hay datos
const createNoDataMessage = (message) => `
    <tr>
        <td colspan="6" class="text-center">
            <p>${message}</p>
        </td>
    </tr>
`;

// Función para obtener la clase de estilo basada en el estado de la factura
const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
        case 'pending': return 'warning';
        case 'approved': return 'primary';
        case 'paid': return 'success';
        case 'processed': return 'info';
        case 'shipped': return 'secondary';
        case 'delivered': return 'success';
        case 'completed': return 'success';
        case 'canceled': return 'danger';
        case 'refunded': return 'info';
        default: return 'secondary';
    }
};

$(document).ready(async function () {
    await loadInvoiceStatuses();  // Cargar los estados de las facturas
    await loadUserProductsFromInvoices();  // Cargar productos de las facturas del usuario
});
