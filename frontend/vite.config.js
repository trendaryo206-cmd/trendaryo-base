import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: './',
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        account: resolve(__dirname, 'account.html'),
        cart: resolve(__dirname, 'cart.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        collection: resolve(__dirname, 'collection.html'),
        contact: resolve(__dirname, 'contact.html'),
        login: resolve(__dirname, 'login.html'),
        orderSuccess: resolve(__dirname, 'order-success.html'),
        product: resolve(__dirname, 'product.html'),
        register: resolve(__dirname, 'register.html'),
        shop: resolve(__dirname, 'shop.html'),
      },
    },
  },
  publicDir: 'assets',
  server: {
    open: true,
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'js', dest: '' },
        { src: 'components', dest: '' },
      ],
    }),
  ],
});
