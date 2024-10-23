$(document).ready(function () {
    
    $.ajax({
        type: "GET",
        url: baseURL + "/products?product_id=1",
        dataType: "json",
        success: function (response) {
            console.log(response);
            
        }
    });
});