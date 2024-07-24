import { Router } from "express";
import { CartsLoader, CartsSave } from '../utils/carts_utils.js';

const router = Router();
let carts = [];

// Cargamos los carritos
const CartsLoad = async () => {
    carts = await CartsLoader();
};


CartsLoad().then(() => {
    router.get('/', (req, res) => {
        res.status(200).json(carts);
    });

    router.get('/:cid', (req, res) => {
        const cartID = parseInt(req.params.cid, 10);
        const cart = carts.find(c => c.id === cartID);
        if (cart) {
            res.status(200).json(cart);
        } else {
            res.status(404).json({ msg: "No se pudo encontrar el carrito"  });
        }
    });

    router.post('/', (req, res) => {
        const { products } = req.body;
        const MaxCartsID = carts.reduce((max, cart) => Math.max(max, cart.id), 0);
        const newCart = {
            id: MaxCartsID + 1,
            products: products || []
        };
        carts.push(newCart);
        CartsSave(carts);
        res.status(201).json(newCart);
    });

    router.post('/:cid/product/:pid', async (req, res) => {
        const cartID = parseInt(req.params.cid, 10);
        const ProdID = parseInt(req.params.pid, 10);
        let quantity = parseInt(req.body.quantity, 10) || 1;

        const cart = carts.find(cart => cart.id === cartID);
        if (!cart) {
            return res.status(404).json({ msg: `El carrito con id: ${cartID} no se encontró` });
        }

        const productInCart = cart.products.find(product => product.id === ProdID);
        if (!productInCart) {
            return res.status(404).json({ msg: `El producto con id: ${ProdID} no se encontró en el carrito` });
        }

        productInCart.quantity += quantity;
        try {
            await CartsSave(carts);
            res.status(200).json({ msg: `El producto con id: ${ProdID} se actualizó correctamente, cantidad agregada: ${quantity}` });
        } catch (error) {
            res.status(500).json({ msg: 'Error al guardar los cambios en el carrito', error: error.message });
        }
    });

    router.delete('/:cid/product/:pid', (req, res) => {
        const cartID = parseInt(req.params.cid, 10);
        const ProdID = parseInt(req.params.pid, 10);
        const cart = carts.find(cart => cart.id === cartID);
        if (!cart) {
            return res.status(404).json({ msg: `no se encontró el carrito con el id: ${cartID}` });
        }
        cart.products = cart.products.filter(product => product.id !== ProdID);
        CartsSave(carts);
        res.status(200).json({ msg: `Se elimino el producto con id: ${ProdID} del carrito con id: ${cartID}` });
    });
});

export default router;