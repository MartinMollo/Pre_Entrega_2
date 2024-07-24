import express, { json, urlencoded } from "express";
import configureProductsRouter from "./routes/products.router.js"; 
import cartsRouter from "./routes/carts.router.js";
import handlebars from 'express-handlebars';
import path from 'path';
import __dirname from "./utils/utils.js";
import { Server } from 'socket.io';
import http from 'http';
import viewsRouter from './routes/views.router.js';

const app = express();
const PORT = 8080;

let products = []; // almacenamos los productos en este array

// Middlewares 
app.use(json());
app.use(urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Routers
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

// Handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'handlebars');

// Servidor HTTP
const httpServer = http.createServer(app);

// Socket.IO
const socketServer = new Server(httpServer);

socketServer.on('connection', socket => {
    console.log("Se conectó un nuevo cliente");

    socket.on('info', data => {
        console.log(`se agregó una nueva data: ${data}`);
    });

    socket.on('productData', data => {
        console.log('Product data received:', data);
        products.push(data); 
        socketServer.emit('productData', data);
    });

    socket.on('removeProduct', data => {
        console.log('Remove product:', data);
        products = products.filter(product => product.id !== data.id); 
        socketServer.emit('productRemoved', data); 
    });
});

app.use("/api/products", configureProductsRouter(socketServer));

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});