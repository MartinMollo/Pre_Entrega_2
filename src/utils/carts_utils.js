import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cartsFilePath = join(__dirname, '../../carts.json');

// Función para inicializar el archivo de carritos si no existe
const CartsStart = async () => {
    try {
        try {
            await fs.access(cartsFilePath);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(cartsFilePath, JSON.stringify([]));
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Failed to initialize carts file:', error);
        throw new Error('Failed to initialize carts file.');
    }
};

// Función para cargar los carritos desde el archivo
export const CartsLoader = async () => {
    try {
        await CartsStart();
        const data = await fs.readFile(cartsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading carts:', error);
        throw new Error('Failed to load carts.');
    }
};

// Función para guardar los carritos en el archivo
export const CartsSave = async (carts) => {
    const data = JSON.stringify(carts, null, 2);
    try {
        await fs.writeFile(cartsFilePath, data);
    } catch (error) {
        console.error('Error saving carts:', error);
        throw new Error('Failed to save carts.');
    }
};