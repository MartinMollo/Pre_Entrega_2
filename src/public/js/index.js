const socket = io();

document.getElementById('productForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    //Emitimos los datos del formulario por el socket
    socket.emit('productData', data);

    // Despues de enviar el formulario, se limpia
    event.target.reset();
});

function AddProductToList(product) {
    const productList = document.getElementById('products');
    const productItem = document.createElement('li');
    productItem.id = `product-${product.id}`;
    productItem.innerHTML = `ID: ${product.id}, Title: ${product.title}, Description: ${product.description}, Code: ${product.code}, Price: ${product.price}, Stock: ${product.stock} 
                             <button onclick="removeProduct(${product.id})">Eliminar</button>`;
    productList.appendChild(productItem);
}

function removeProduct(id) {
    // Emitimos el evento de eliminación por el socket
    socket.emit('removeProduct', { id });
}

socket.on('productRemoved', (data) => {
    // Eliminamos el producto del DOM
    const productItem = document.getElementById(`product-${data.id}`);
    if (productItem) {
        productItem.remove();
    }
});

socket.on('productData', (data) => {
    // Añadimos el producto al DOM
    AddProductToList(data);
});