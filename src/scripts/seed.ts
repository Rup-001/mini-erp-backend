const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User, { hashPassword } from '../modules/user/user.model';
import Product from '../modules/product/product.model';
import Sale from '../modules/sale/sale.model';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedUsers = [
  { name: 'Admin User', email: 'admin@mini-erp.com', password: 'Admin@123', role: 'admin' as const },
  { name: 'Manager User', email: 'manager@mini-erp.com', password: 'Manager@123', role: 'manager' as const },
  { name: 'Employee User', email: 'employee@mini-erp.com', password: 'Employee@123', role: 'employee' as const },
];

const seedProducts = [
  { name: 'USB Cable Type-C', sku: 'SKU-1001', category: 'Electronics', purchasePrice: 5, sellingPrice: 12, stockQuantity: 50, imageUrl: '/uploads/products/demo-usb-cable.jpg' },
  { name: 'Wireless Mouse', sku: 'SKU-1002', category: 'Electronics', purchasePrice: 15, sellingPrice: 29, stockQuantity: 3, imageUrl: '/uploads/products/demo-mouse.jpg' },
  { name: 'Notebook A5', sku: 'SKU-1003', category: 'Stationery', purchasePrice: 2, sellingPrice: 5, stockQuantity: 100, imageUrl: '/uploads/products/demo-notebook.jpg' },
  { name: 'Bluetooth Headphones', sku: 'SKU-1004', category: 'Electronics', purchasePrice: 25, sellingPrice: 49, stockQuantity: 20, imageUrl: '/uploads/products/demo-headphones.jpg' },
  { name: 'Mechanical Keyboard', sku: 'SKU-1005', category: 'Electronics', purchasePrice: 45, sellingPrice: 89, stockQuantity: 8, imageUrl: '/uploads/products/demo-keyboard.jpg' },
  { name: 'HDMI Cable 2m', sku: 'SKU-1006', category: 'Electronics', purchasePrice: 4, sellingPrice: 10, stockQuantity: 2, imageUrl: '/uploads/products/demo-hdmi.jpg' },
  { name: 'Ballpoint Pen Pack', sku: 'SKU-1007', category: 'Stationery', purchasePrice: 1, sellingPrice: 3, stockQuantity: 200, imageUrl: '/uploads/products/demo-pen.jpg' },
  { name: 'Sticky Notes 100pcs', sku: 'SKU-1008', category: 'Stationery', purchasePrice: 1.5, sellingPrice: 4, stockQuantity: 4, imageUrl: '/uploads/products/demo-sticky.jpg' },
  { name: 'Laptop Stand', sku: 'SKU-1009', category: 'Accessories', purchasePrice: 12, sellingPrice: 25, stockQuantity: 15, imageUrl: '/uploads/products/demo-stand.jpg' },
  { name: 'Webcam HD 1080p', sku: 'SKU-1010', category: 'Electronics', purchasePrice: 20, sellingPrice: 39, stockQuantity: 0, imageUrl: '/uploads/products/demo-webcam.jpg' },
  { name: 'Desk Organizer', sku: 'SKU-1011', category: 'Accessories', purchasePrice: 8, sellingPrice: 18, stockQuantity: 12, imageUrl: '/uploads/products/demo-organizer.jpg' },
  { name: 'Whiteboard Marker Set', sku: 'SKU-1012', category: 'Stationery', purchasePrice: 3, sellingPrice: 7, stockQuantity: 1, imageUrl: '/uploads/products/demo-marker.jpg' },
];

interface DemoSale {
  role: 'admin' | 'manager' | 'employee';
  items: { sku: string; quantity: number }[];
}

const demoSales: DemoSale[] = [
  { role: 'employee', items: [{ sku: 'SKU-1001', quantity: 2 }, { sku: 'SKU-1003', quantity: 5 }] },
  { role: 'manager', items: [{ sku: 'SKU-1004', quantity: 1 }] },
  { role: 'employee', items: [{ sku: 'SKU-1007', quantity: 10 }] },
  { role: 'admin', items: [{ sku: 'SKU-1005', quantity: 2 }, { sku: 'SKU-1009', quantity: 1 }] },
];

const seed = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mini-erp';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  await Sale.deleteMany({});
  await Product.deleteMany({});
  await User.deleteMany({});

  const users: Record<string, { _id: mongoose.Types.ObjectId; role: string }> = {};

  for (const userData of seedUsers) {
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      passwordHash: await hashPassword(userData.password),
      role: userData.role,
    });
    users[userData.role] = { _id: user._id, role: userData.role };
    console.log(`Created user: ${userData.email} (${userData.role})`);
  }

  const productMap = new Map<string, mongoose.Types.ObjectId>();
  for (const product of seedProducts) {
    const created = await Product.create({ ...product, createdBy: users.admin._id });
    productMap.set(product.sku, created._id);
    console.log(`Created product: ${product.name} (stock: ${product.stockQuantity})`);
  }

  for (const saleData of demoSales) {
    const saleItems: { product: mongoose.Types.ObjectId; quantity: number; unitPrice: number; subtotal: number }[] = [];
    let grandTotal = 0;

    for (const item of saleData.items) {
      const product = await Product.findOne({ sku: item.sku });
      if (!product) continue;

      const subtotal = item.quantity * product.sellingPrice;
      saleItems.push({
        product: product._id,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        subtotal,
      });
      grandTotal += subtotal;

      await Product.updateOne({ _id: product._id }, { $inc: { stockQuantity: -item.quantity } });
    }

    await Sale.create({
      items: saleItems,
      grandTotal,
      soldBy: users[saleData.role]._id,
    });

    console.log(`Created sale: $${grandTotal.toFixed(2)} by ${saleData.role}`);
  }

  console.log('\n========================================');
  console.log('Seed completed successfully!');
  console.log('========================================\n');

  console.log('Login credentials:');
  seedUsers.forEach((u) => console.log(`  ${u.role.padEnd(8)} → ${u.email} / ${u.password}`));

  console.log('\nDemo data summary:');
  console.log(`  Users:    ${seedUsers.length}`);
  console.log(`  Products: ${seedProducts.length} (includes low-stock & out-of-stock items)`);
  console.log(`  Sales:    ${demoSales.length} sample transactions`);

  console.log('\nLow-stock products (stock < 5, before sales):');
  seedProducts
    .filter((p) => p.stockQuantity < 5)
    .forEach((p) => console.log(`  - ${p.name} (${p.sku}): ${p.stockQuantity} units`));

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
