// Función para cargar las facturas del usuario actual
const loadUserInvoices = async () => {
    const userId = getCookie('userId');

    try {
        // Obtener facturas del usuario actual
        const invoices = await $.ajax({
            type: 'GET',
            url: `${baseURL}/invoices?userId=${userId}`,
            dataType: 'json'
        });

        const tbody = $('#invoices-tbody');
        tbody.empty(); // Limpiar contenido anterior

        if (invoices.length === 0) {
            tbody.append(createNoDataMessage('No invoices found.'));
            return;
        }

        // Iterar sobre las facturas y agregar las filas a la tabla
        invoices.forEach(invoice => {
            tbody.append(createInvoiceRow(invoice));
        });
    } catch (error) {
        console.error('Error al cargar las facturas del usuario:', error);
    }
};

// Función para crear una fila de factura
const createInvoiceRow = (invoice) => {
    // Calcular el total sumando el shippingCost y el total_amount, luego restando el descuento
    const totalWithShippingAndDiscount = (parseFloat(invoice.total_amount) + parseFloat(invoice.shippingCost)) - parseFloat(invoice.discount);

    return `
        <tr>
            <td class="text-center checkbox-cell">
                <div class="d-flex align-items-center">
                    <div class="checkbox-group-wrapper">
                        <div class="checkbox-group d-flex me-3">
                            <div class="checkbox-theme-default custom-checkbox checkbox-group__single d-flex">
                                <input class="checkbox" type="checkbox" id="check-inv-${invoice.id}">
                                <label for="check-inv-${invoice.id}"></label>
                            </div>
                        </div>
                    </div>
                </div>
            </td>
            <td class="text-center">
                <div class="d-flex align-items-center">
                    <div class="orderDatatable-title">
                        <p class="d-block mb-0">${invoice.id}</p>
                    </div>
                </div>
            </td>
            <td class="text-center">
                <div class="orderDatatable-title">
                    $${parseFloat(invoice.total_amount).toFixed(2)} <!-- Muestra el total_amount -->
                </div>
            </td>
            <td class="text-center">
                <div class="orderDatatable-title">
                    $${parseFloat(invoice.shippingCost).toFixed(2)} <!-- Muestra el shippingCost -->
                </div>
            </td>
            <td class="text-center">
                <div class="orderDatatable-title">
                    $${parseFloat(invoice.discount).toFixed(2)} <!-- Muestra el descuento -->
                </div>
            </td>
            <td class="text-center">
                <div class="orderDatatable-title">
                    $${totalWithShippingAndDiscount.toFixed(2)} <!-- Muestra el total ajustado -->
                </div>
            </td>
            <td class="text-center">
                <div class="orderDatatable-title">
                    ${new Date(invoice.created_at).toLocaleDateString()} <!-- Muestra la fecha de la factura -->
                </div>
            </td>
            <td class="text-center">
                <ul class="orderDatatable_actions mb-0 d-flex flex-wrap justify-content-end">
                    <li>
                        <a href="invoice.html?invoiceId=${invoice.id}" class="edit">
                            <i class="uil uil-eye"></i>
                        </a>
                    </li>
                </ul>
            </td>
        </tr>
    `;
};


// Función para mostrar un mensaje cuando no hay datos
const createNoDataMessage = (message) => `
    <tr>
        <td colspan="5" class="text-center"> <!-- Cambié a 5 columnas para coincidir con las columnas nuevas -->
            <p>${message}</p>
        </td>
    </tr>
`;

$(document).ready(async function () {
    await loadUserInvoices(); // Cargar las facturas del usuario actual
});
