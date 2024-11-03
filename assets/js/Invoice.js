// Función para cargar la información de una factura específica
const loadInvoiceDetails = async (invoiceId) => {
    try {
        // Obtener la factura por ID
        const invoice = await $.ajax({
            type: 'GET',
            url: `${baseURL}/invoices/${invoiceId}`,
            dataType: 'json'
        });

        const tbody = $('#cart tbody');
        tbody.empty(); // Limpiar contenido anterior

        if (!invoice || invoice.products.length === 0) {
            tbody.append(createNoDataMessage('No products found for this invoice.'));
            return;
        }

        let subtotal = 0;
        const shippingCost = invoice.shippingCost;
        const discount = invoice.discount; // Obtener el descuento
        
        // Iterar sobre los productos y agregar las filas a la tabla
        invoice.products.forEach((product, index) => {
            const totalProduct = product.price_per_unit * product.quantity;
            subtotal += totalProduct;

            tbody.append(`
                <tr>
                    <th>${index + 1}</th>
                    <td class="Product-cart-title">
                        <div class="media align-items-center">
                            <div class="media-body">
                                <h5 class="mt-0">${product.product_name}</h5>
                                <div class="d-flex">
                                    <p>Size:<span>large</span></p>
                                    <p>color:<span>brown</span></p>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="unit text-end">$${parseFloat(product.price_per_unit).toFixed(2)}</td>
                    <td class="invoice-quantity text-end">${product.quantity}</td>
                    <td class="text-end order">$${totalProduct.toFixed(2)}</td>
                </tr>
            `);
        });

        // Calcular el total restando el descuento
        const total = subtotal + shippingCost - discount;

        // Actualizar el pie de la tabla con los totales
        const tfoot = `
            <tr>
                <td colspan="3"></td>
                <td class="order-summery float-right border-0">
                    <div class="total">
                        <div class="subtotalTotal mb-0 text-end">
                            Subtotal :
                        </div>
                        <div class="taxes mb-0 text-end">
                            Discount :
                        </div>
                        <div class="shipping mb-0 text-end">
                            Shipping charge :
                        </div>
                    </div>
                    <div class="total-money mt-2 text-end">
                        <h6>Total :</h6>
                    </div>
                </td>
                <td>
                    <div class="total-order float-right text-end fs-14 fw-500">
                        <p>$${subtotal.toFixed(2)}</p>
                        <p>-$${discount.toFixed(2)}</p> <!-- Mostrar el descuento -->
                        <p>$${shippingCost.toFixed(2)}</p>
                        <h5 class="text-primary">$${total.toFixed(2)}</h5>
                    </div>
                </td>
            </tr>
        `;

        $('tfoot').html(tfoot); // Añadir el pie de tabla con totales
    } catch (error) {
        console.error('Error al cargar los detalles de la factura:', error);
    }
};


$(document).ready(async function () {
    // Obtener el invoiceId de la URL
    const params = new URLSearchParams(window.location.search);
    const invoiceId = params.get('invoiceId'); // Obtener el valor de 'invoiceId'

    if (invoiceId) {
        await loadInvoiceDetails(invoiceId); // Cargar los detalles de la factura
    } else {
        console.error('No invoiceId found in the URL');
    }
});
