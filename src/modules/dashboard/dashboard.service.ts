import Product from '../product/product.model';
import Sale from '../sale/sale.model';

export const getDashboardStats = async () => {
  const [totalProducts, saleStats, lowStockProducts] = await Promise.all([
    Product.countDocuments(),
    Sale.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$grandTotal' },
        },
      },
    ]),
    Product.find({ stockQuantity: { $lt: 5 } }).select('name sku stockQuantity category').sort('stockQuantity'),
  ]);

  const stats = saleStats[0] || { totalSales: 0, totalRevenue: 0 };

  return {
    totalProducts,
    totalSales: stats.totalSales,
    totalRevenue: stats.totalRevenue,
    lowStockProducts,
  };
};
