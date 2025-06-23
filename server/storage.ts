import { 
  users, brands, categories, products, cartItems, orders, orderItems,
  type User, type InsertUser, type Brand, type InsertBrand,
  type Category, type InsertCategory, type Product, type InsertProduct,
  type CartItem, type InsertCartItem, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type ProductWithBrandAndCategory,
  type CartItemWithProduct, type OrderWithItems
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Brands
  getAllBrands(): Promise<Brand[]>;
  getBrand(id: number): Promise<Brand | undefined>;
  getBrandBySlug(slug: string): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;

  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Products
  getAllProducts(filters?: { brandId?: number; categoryId?: number; search?: string }): Promise<ProductWithBrandAndCategory[]>;
  getProduct(id: number): Promise<ProductWithBrandAndCategory | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Cart Items
  getCartItems(userId?: number, sessionId?: string): Promise<CartItemWithProduct[]>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(userId?: number, sessionId?: string): Promise<boolean>;

  // Orders
  getOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private brands: Map<number, Brand>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private currentUserId: number;
  private currentBrandId: number;
  private currentCategoryId: number;
  private currentProductId: number;
  private currentCartItemId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;

  constructor() {
    this.users = new Map();
    this.brands = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.currentUserId = 1;
    this.currentBrandId = 1;
    this.currentCategoryId = 1;
    this.currentProductId = 1;
    this.currentCartItemId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;

    this.seedData();
  }

  private seedData() {
    // Seed brands
    const brandsData = [
      { name: "Toyota", slug: "toyota", logoUrl: "https://images.unsplash.com/photo-1629897048514-3dd7414fe72a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100" },
      { name: "BMW", slug: "bmw", logoUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100" },
      { name: "Ford", slug: "ford", logoUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100" },
      { name: "Mercedes", slug: "mercedes", logoUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100" },
      { name: "Audi", slug: "audi", logoUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100" },
      { name: "Honda", slug: "honda", logoUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100" },
      { name: "Volkswagen", slug: "volkswagen", logoUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100" },
      { name: "Nissan", slug: "nissan", logoUrl: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100" },
    ];

    brandsData.forEach(brand => {
      const newBrand: Brand = { ...brand, id: this.currentBrandId++ };
      this.brands.set(newBrand.id, newBrand);
    });

    // Seed categories
    const categoriesData = [
      { name: "Engine Parts", slug: "engine", description: "Pistons, gaskets, filters, belts and more", iconName: "cog" },
      { name: "Brake System", slug: "brakes", description: "Brake pads, discs, calipers, fluid", iconName: "car-crash" },
      { name: "Suspension", slug: "suspension", description: "Shocks, struts, springs, bushings", iconName: "arrows-alt-v" },
      { name: "Interior Accessories", slug: "interior", description: "Seat covers, floor mats, dashboards", iconName: "chair" },
      { name: "Exterior Body", slug: "exterior", description: "Bumpers, mirrors, lights, trim", iconName: "car" },
      { name: "Electronics", slug: "electronics", description: "ECU, sensors, wiring, alternators", iconName: "microchip" },
    ];

    categoriesData.forEach(category => {
      const newCategory: Category = { ...category, id: this.currentCategoryId++ };
      this.categories.set(newCategory.id, newCategory);
    });

    // Seed products
    const productsData = [
      { name: "Premium Brake Pads Set", description: "High-performance ceramic brake pads", price: "89.99", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200", brandId: 1, categoryId: 2, rating: "4.0", reviewCount: 152 },
      { name: "Engine Oil Filter", description: "OEM quality oil filter for BMW", price: "24.99", imageUrl: "https://images.unsplash.com/photo-1486754735734-325b5831c3ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200", brandId: 2, categoryId: 1, rating: "5.0", reviewCount: 203 },
      { name: "Shock Absorber Pair", description: "Heavy-duty suspension shock absorbers", price: "156.99", imageUrl: "https://images.unsplash.com/photo-1592853625511-ad0edcc69c07?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200", brandId: 3, categoryId: 3, rating: "4.0", reviewCount: 89 },
      { name: "LED Headlight Bulbs", description: "Super bright 6000K LED conversion kit", price: "45.99", imageUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200", brandId: 8, categoryId: 6, rating: "5.0", reviewCount: 341 },
      { name: "12V Car Battery", description: "Heavy-duty maintenance-free battery", price: "129.99", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200", brandId: 8, categoryId: 6, rating: "4.0", reviewCount: 167 },
      { name: "Timing Belt Kit", description: "Complete timing belt replacement kit", price: "198.99", imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200", brandId: 6, categoryId: 1, rating: "5.0", reviewCount: 94 },
      { name: "Engine Air Filter", description: "High-flow performance air filter", price: "32.99", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200", brandId: 1, categoryId: 1, rating: "4.0", reviewCount: 278 },
      { name: "Spark Plugs Set", description: "Iridium spark plugs for better performance", price: "67.99", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200", brandId: 8, categoryId: 1, rating: "5.0", reviewCount: 412 },
      { name: "Leather Seat Covers", description: "Premium leather seat cover set", price: "189.99", imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200", brandId: 4, categoryId: 4, rating: "4.0", reviewCount: 134 },
      { name: "Carbon Fiber Spoiler", description: "Lightweight carbon fiber rear spoiler", price: "299.99", imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200", brandId: 2, categoryId: 5, rating: "4.0", reviewCount: 76 },
      { name: "Performance Exhaust System", description: "Stainless steel performance exhaust", price: "449.99", imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200", brandId: 3, categoryId: 1, rating: "5.0", reviewCount: 98 },
      { name: "All-Weather Floor Mats", description: "Waterproof rubber floor mat set", price: "79.99", imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200", brandId: 8, categoryId: 4, rating: "4.0", reviewCount: 256 },
    ];

    productsData.forEach(product => {
      const newProduct: Product = { 
        ...product, 
        id: this.currentProductId++, 
        inStock: true 
      };
      this.products.set(newProduct.id, newProduct);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Brands
  async getAllBrands(): Promise<Brand[]> {
    return Array.from(this.brands.values());
  }

  async getBrand(id: number): Promise<Brand | undefined> {
    return this.brands.get(id);
  }

  async getBrandBySlug(slug: string): Promise<Brand | undefined> {
    return Array.from(this.brands.values()).find(brand => brand.slug === slug);
  }

  async createBrand(insertBrand: InsertBrand): Promise<Brand> {
    const id = this.currentBrandId++;
    const brand: Brand = { 
      ...insertBrand, 
      id,
      logoUrl: insertBrand.logoUrl || null
    };
    this.brands.set(id, brand);
    return brand;
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(category => category.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { 
      ...insertCategory, 
      id,
      description: insertCategory.description || null,
      iconName: insertCategory.iconName || null
    };
    this.categories.set(id, category);
    return category;
  }

  // Products
  async getAllProducts(filters?: { brandId?: number; categoryId?: number; search?: string }): Promise<ProductWithBrandAndCategory[]> {
    let products = Array.from(this.products.values());

    if (filters?.brandId) {
      products = products.filter(p => p.brandId === filters.brandId);
    }

    if (filters?.categoryId) {
      products = products.filter(p => p.categoryId === filters.categoryId);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    return products.map(product => ({
      ...product,
      brand: product.brandId ? this.brands.get(product.brandId) || null : null,
      category: product.categoryId ? this.categories.get(product.categoryId) || null : null,
    }));
  }

  async getProduct(id: number): Promise<ProductWithBrandAndCategory | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    return {
      ...product,
      brand: product.brandId ? this.brands.get(product.brandId) || null : null,
      category: product.categoryId ? this.categories.get(product.categoryId) || null : null,
    };
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      ...insertProduct, 
      id,
      description: insertProduct.description || null,
      imageUrl: insertProduct.imageUrl || null,
      brandId: insertProduct.brandId || null,
      categoryId: insertProduct.categoryId || null,
      inStock: insertProduct.inStock ?? true,
      rating: insertProduct.rating || null,
      reviewCount: insertProduct.reviewCount || null
    };
    this.products.set(id, product);
    return product;
  }

  // Cart Items
  async getCartItems(userId?: number, sessionId?: string): Promise<CartItemWithProduct[]> {
    let items = Array.from(this.cartItems.values());

    if (userId) {
      items = items.filter(item => item.userId === userId);
    } else if (sessionId) {
      items = items.filter(item => item.sessionId === sessionId);
    }

    const cartItemsWithProducts: CartItemWithProduct[] = [];
    for (const item of items) {
      const product = await this.getProduct(item.productId!);
      if (product) {
        cartItemsWithProducts.push({
          ...item,
          product,
        });
      }
    }

    return cartItemsWithProducts;
  }

  async addCartItem(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists for this user/session and product
    const existingItems = Array.from(this.cartItems.values()).filter(item => {
      if (insertCartItem.userId) {
        return item.userId === insertCartItem.userId && item.productId === insertCartItem.productId;
      } else {
        return item.sessionId === insertCartItem.sessionId && item.productId === insertCartItem.productId;
      }
    });

    if (existingItems.length > 0) {
      // Update existing item quantity
      const existingItem = existingItems[0];
      existingItem.quantity += insertCartItem.quantity || 1;
      return existingItem;
    } else {
      // Create new item
      const id = this.currentCartItemId++;
      const cartItem: CartItem = { 
        ...insertCartItem,
        id,
        userId: insertCartItem.userId || null,
        productId: insertCartItem.productId || null,
        quantity: insertCartItem.quantity || 1,
        sessionId: insertCartItem.sessionId || null
      };
      this.cartItems.set(id, cartItem);
      return cartItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;

    item.quantity = quantity;
    return item;
  }

  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId?: number, sessionId?: string): Promise<boolean> {
    const items = Array.from(this.cartItems.entries()).filter(([_, item]) => {
      if (userId) {
        return item.userId === userId;
      } else if (sessionId) {
        return item.sessionId === sessionId;
      }
      return false;
    });

    items.forEach(([id]) => {
      this.cartItems.delete(id);
    });

    return true;
  }

  // Orders
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const orderItems = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id)
      .map(item => ({
        ...item,
        product: this.products.get(item.productId!)!,
      }));

    return {
      ...order,
      items: orderItems,
    };
  }

  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const orderId = this.currentOrderId++;
    const order: Order = { 
      ...insertOrder, 
      id: orderId, 
      createdAt: new Date(),
      status: insertOrder.status || 'pending',
      userId: insertOrder.userId || null
    };
    this.orders.set(orderId, order);

    // Create order items
    items.forEach(insertItem => {
      const itemId = this.currentOrderItemId++;
      const orderItem: OrderItem = { 
        ...insertItem, 
        id: itemId, 
        orderId,
        productId: insertItem.productId || null
      };
      this.orderItems.set(itemId, orderItem);
    });

    return order;
  }
}

export const storage = new MemStorage();
