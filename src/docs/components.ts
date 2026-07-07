/**
 * @swagger
 * components:
 *   schemas:
 *     ApiSuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: Operation successful
 *         data:
 *           type: object
 *
 *     ApiErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         statusCode:
 *           type: integer
 *           example: 400
 *         message:
 *           type: string
 *           example: Validation failed
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         totalPages:
 *           type: integer
 *           example: 3
 *         totalResults:
 *           type: integer
 *           example: 25
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, manager, employee]
 *
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@mini-erp.com
 *         password:
 *           type: string
 *           example: Admin@123
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         accessToken:
 *           type: string
 *
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         sku:
 *           type: string
 *         category:
 *           type: string
 *         purchasePrice:
 *           type: number
 *         sellingPrice:
 *           type: number
 *         stockQuantity:
 *           type: number
 *         imageUrl:
 *           type: string
 *         createdBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     SaleItem:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *         quantity:
 *           type: integer
 *         unitPrice:
 *           type: number
 *         subtotal:
 *           type: number
 *
 *     Sale:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SaleItem'
 *         grandTotal:
 *           type: number
 *         soldBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     CreateSaleRequest:
 *       type: object
 *       required: [items]
 *       properties:
 *         items:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *
 *     DashboardStats:
 *       type: object
 *       properties:
 *         totalProducts:
 *           type: integer
 *         totalSales:
 *           type: integer
 *         totalRevenue:
 *           type: number
 *         lowStockProducts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Product'
 */

export {};
