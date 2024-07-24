import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const productsFilePath = join(__dirname, '../../products.json');

// Función para inicializar el archivo de productos si no existe
const initializeProductsFile = async () => {
    try {
        try {
            await fs.access(productsFilePath);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(productsFilePath, JSON.stringify([]));
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error initializing the products file:', error);
        throw new Error('Failed to initialize products file.');
    }
};

// Función para cargar los productos desde el archivo
export const ProductsLoader = async () => {
    try {
        await initializeProductsFile();
        const data = await fs.readFile(productsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading products:', error);
        throw new Error('Failed to load products.');
    }
};

// Función para guardar los productos en el archivo
export const Productssave = async (products) => {
    const data = JSON.stringify(products, null, 2);
    try {
        await fs.writeFile(productsFilePath, data);
    } catch (error) {
        console.error('Error saving products:', error);
        throw new Error('Failed to save products.');
    }
};