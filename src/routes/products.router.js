import { Router } from "express";
import { ProductsLoader, Productssave } from '../utils/products_utils.js';

const router = Router();

let products = [];

// Cargamos los productos
const ProductsLoad = async () => {
    products = await ProductsLoader();
};

ProductsLoad().then(() => {
    router.get('/', (req, res) => {
        const limit = parseInt(req.query.limit, 10);
        if (Number.isInteger(limit) && limit > 0) {
            res.status(200).json(products.slice(0, limit));
        } else {
            res.status(200).json(products);
        }
    });
});

router.get('/:pid', (req, res) => {
    const ProdID = parseInt(req.params.pid, 10);
    const product = products.find(product => product.id === ProdID);
    if (product) {
        res.status(200).json(product);
    } else {
        res.status(404).json({ msg: "No se encontró el producto" });
    }
});

const RouterConfig = (io) => {
    router.post('/', async (req, res) => {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;
        if (!title || !description || !code || price <= 0 || stock < 0 || !category) {
            return res.status(400).json({ msg: "El producto fue mal ingresado" });
        }
        const MaxProdID = products.reduce((max, product) => Math.max(max, product.id), 0);
        const newProduct = {
            id: MaxProdID + 1,
            title,
            description,
            code,
            price,
            status: status ?? true,
            stock,
            category,
            thumbnails
        };
        products.push(newProduct);
        try {
            await Productssave(products);
            res.status(201).json(newProduct);
            io.emit('productData', newProduct);
        } catch (error) {
            res.status(500).json({ msg: 'Error guardando el producto', error: error.message });
        }
    });

    router.put('/:pid', async (req, res) => {
        const ProdID = parseInt(req.params.pid, 10);
        const productIndex = products.findIndex(product => product.id === ProdID);

        if (productIndex !== -1) {
            const product = products[productIndex];
            const { title, description, code, price, status, stock, category, thumbnails } = req.body;
            product.title = title ?? product.title;
            product.description = description ?? product.description;
            product.code = code ?? product.code;
            product.price = price ?? product.price;
            product.status = status ?? product.status;
            product.stock = stock ?? product.stock;
            product.category = category ?? product.category;
            product.thumbnails = thumbnails ?? product.thumbnails;

            try {
                await Productssave(products);
                res.json(product);

                // Emitir el evento de actualización de producto a través de Socket.IO
                io.emit('productData', product);
            } catch (error) {
                res.status(500).json({ msg: 'Error al actualizar el producto', error: error.message });
            }
        } else {
            res.status(404).json({ msg: "no se econtró el producto" });
        }
    });

    router.delete('/:pid', async (req, res) => {
        const ProdID = parseInt(req.params.pid, 10);
        const productIndex = products.findIndex(product => product.id === ProdID);
        if (productIndex !== -1) {
            const removedProduct = products.splice(productIndex, 1);

            try {
                await Productssave(products);
                res.status(200).json({ msg: `se eliminó el producto con id: ${ProdID}` });

                // Emitir el evento de eliminación de producto a través de Socket.IO
                io.emit('productRemoved', { id: ProdID });
            } catch (error) {
                res.status(500).json({ msg: 'Error eliminando el producto', error: error.message });
            }
        } else {
            res.status(404).json({ msg: "no se econtró el producto" });
        }
    });

    return router;
};

export default RouterConfig;