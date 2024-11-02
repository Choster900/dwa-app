function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(';').shift() : null;
}

function getParameterByName(name) {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const loadCategories = () => {
    $.ajax({
        type: 'GET',
        url: `${baseURL}/categories`,
        dataType: 'json',
        success: function (categories) {
            const categorySelect = $('#categoryOption');
            categorySelect.empty();
            categorySelect.append('<option value="">Select a category</option>');

            categories.forEach(category => {
                categorySelect.append(`<option value="${category.id}">${category.category_name}</option>`);
            });
        },
        error: function () {
            console.error('Error al cargar las categorías');
        }
    });
};

const loadBrands = () => {
    $.ajax({
        type: 'GET',
        url: `${baseURL}/brands`,
        dataType: 'json',
        success: function (brands) {
            const brandSelect = $('#brandOption');
            brandSelect.empty();
            brandSelect.append('<option value="">Select a brand</option>');

            brands.forEach(brand => {
                brandSelect.append(`<option value="${brand.id}">${brand.brand_name}</option>`);
            });
        },
        error: function () {
            console.error('Error al cargar las marcas');
        }
    });
};

const loadProduct = (productId, userId) => {
    $.ajax({
        type: 'GET',
        url: `${baseURL}/products/${productId}?_embed=brand&_embed=category`, // Cargar el producto con su marca y categoría
        dataType: 'json',
        success: function (product) {

            console.log({ "idP":product.userId, userId});
            
            if (product.userId !== userId) {
                alert("No tienes permiso para editar este producto.");
                window.location.href = "./product.html"; 
                return;
            }
            
            $('#name1').val(product.product_name);
            $('#exampleFormControlTextarea1').val(product.product_description);
            $('#categoryOption').val(product.categorieId).trigger('change');
            $('#brandOption').val(product.brandId).trigger('change');
            $('input[type="number"][min="0"]').eq(0).val(product.product_price);
            $('input[type="number"][min="0"]').eq(1).val(product.discount_price || ''); // Manejo de precio con descuento
            $('input[type="number"][min="0"]').eq(2).val(product.available_stock);
            $(`input[name="radio-optional"][value="${product.status === 'published' ? '0' : '1'}"]`).prop('checked', true); // Ajustar estado
        },
        error: function () {
            console.error('Error al cargar el producto');
        }
    });
};

$(document).ready(function () {
    loadCategories();
    loadBrands();

    const productId = getParameterByName('productId');
    const userId = getCookie('userId');
    console.log(userId);
    
    if (productId) {
        loadProduct(productId, userId);
    }

    $('.btn-primary').on('click', function (e) {
        e.preventDefault();

        const productName = $('#name1').val().trim();
        const categoryId = $('#categoryOption').val();
        const brandId = $('#brandOption').val();
        const price = $('input[type="number"][min="0"]').eq(0).val();
        const discount = $('input[type="number"][min="0"]').eq(1).val();
        const status = $('input[name="radio-optional"]:checked').val();
        const description = $('#exampleFormControlTextarea1').val().trim();
        const imageUrl = "https://example.com/images/headphones.jpg";
        const stock = $('input[type="number"][min="0"]').eq(2).val();

        if (!productName || !categoryId || !brandId || !price || !status || !userId) {
            alert('Please fill all required fields.');
            return;
        }

        const productData = {
            product_name: productName,
            product_description: description,
            product_price: parseFloat(price),
            userId: userId,
            available_stock: stock,
            categorieId: parseInt(categoryId),
            brandId: brandId,
            status: status === "0" ? "published" : "draft",
            discount_price: discount ? parseFloat(discount) : null,
            image_url: imageUrl,
            updated_at: new Date().toISOString().split('T')[0]
        };

        // Si `productId` existe, usa `PATCH` para actualizar solo los campos modificados
        if (productId) {
            $.ajax({
                type: 'PATCH',
                url: `${baseURL}/products/${productId}`,
                contentType: 'application/json',
                data: JSON.stringify(productData),
                success: function (response) {
                    console.log('Product updated successfully:', response);
                    alert('Product updated successfully!');
                },
                error: function () {
                    console.error('Error occurred while updating the product');
                    alert('Error occurred while trying to update the product. Please try again.');
                }
            });
        } else {
            // Crear nuevo producto si `productId` no existe
            $.ajax({
                type: 'POST',
                url: `${baseURL}/products`,
                contentType: 'application/json',
                data: JSON.stringify(productData),
                success: function (response) {
                    console.log('Product saved successfully:', response);
                    alert('Product saved successfully!');
                },
                error: function () {
                    console.error('Error occurred while saving the product');
                    alert('Error occurred while trying to save the product. Please try again.');
                }
            });
        }
    });
});
