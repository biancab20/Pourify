// types/DummyData.js

// First, define all your model classes
export class User {
  constructor(userId, email, roles) {
    this.userId = userId;
    this.email = email;
    this.roles = roles;
  }
}

export class AuthResponse {
  constructor(accessToken, refreshToken, expiresIn, tokenType, user) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresIn = expiresIn;
    this.tokenType = tokenType;
    this.user = user;
  }
}

export class Product {
  constructor(productId, name, volume, type) {
    this.productId = productId;
    this.name = name;
    this.volume = volume;
    this.type = type;
  }
}

export class ProductListResponse {
  constructor(items, totalCount) {
    this.items = items;
    this.totalCount = totalCount;
  }
}

export class Supplier {
  constructor(supplierId, name, email, createdAt = null) {
    this.supplierId = supplierId;
    this.name = name;
    this.email = email;
    this.createdAt = createdAt;
  }
}

export class SupplierListResponse {
  constructor(items, totalCount) {
    this.items = items;
    this.totalCount = totalCount;
  }
}

export class Bar {
  constructor(barId, name) {
    this.barId = barId;
    this.name = name;
  }
}

export class BarListResponse {
  constructor(items, totalCount) {
    this.items = items;
    this.totalCount = totalCount;
  }
}

export class StockItem {
  constructor(stockId, storagePlaceId, productId, volume, lastUpdatedAt) {
    this.stockId = stockId;
    this.storagePlaceId = storagePlaceId;
    this.productId = productId;
    this.volume = volume;
    this.lastUpdatedAt = lastUpdatedAt;
  }
}

export class StockResponse {
  constructor(barId, name, totalVolume, items, totalCount) {
    this.barId = barId;
    this.name = name;
    this.totalVolume = totalVolume;
    this.items = items;
    this.totalCount = totalCount;
  }
}

export class DeliveryProduct {
  constructor(productId, name, volume, type) {
    this.productId = productId;
    this.name = name;
    this.volume = volume;
    this.type = type;
  }
}

export class Delivery {
  constructor(deliveryNoteId, deliveryDate, supplier, products, deliveryNotePictureId, deliveryPilePictureId) {
    this.deliveryNoteId = deliveryNoteId;
    this.deliveryDate = deliveryDate;
    this.supplier = supplier;
    this.products = products;
    this.deliveryNotePictureId = deliveryNotePictureId;
    this.deliveryPilePictureId = deliveryPilePictureId;
  }
}

export class DeliveryListResponse {
  constructor(items, totalCount) {
    this.items = items;
    this.totalCount = totalCount;
  }
}

export class Photo {
  constructor(photoId, fileName, contentType, url, createdAt) {
    this.photoId = photoId;
    this.fileName = fileName;
    this.contentType = contentType;
    this.url = url;
    this.createdAt = createdAt;
  }
}

export class PhotoResponse {
  constructor(photo) {
    this.photo = photo;
  }
}

export class UploadPhotoResponse {
  constructor(photo, ocrId) {
    this.photo = photo;
    this.ocrId = ocrId;
  }
}

export class OcrResponse {
  constructor(photo, queueId) {
    this.photo = photo;
    this.queueId = queueId;
  }
}

export class OcrProduct {
  constructor(name, volume, amount, type) {
    this.name = name;
    this.volume = volume;
    this.amount = amount;
    this.type = type;
  }
}

export class OcrResult {
  constructor(rawText, deliveryData) {
    this.rawText = rawText;
    this.deliveryData = deliveryData;
  }
}

export class OcrResultResponse {
  constructor(ocrResult) {
    this.ocrResult = ocrResult;
  }
}

// Now create the dummy data using these classes
export const dummyData = {
  // Auth
  auth: new AuthResponse(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "dGhpcyBpcyBhIGR1bW15IHJlZnJlc2ggdG9rZW4...",
    3600,
    "Bearer",
    new User("user-123", "user@example.com", ["admin", "bartender"])
  ),

  // Products
  products: new ProductListResponse([
    new Product(101, "Beer Keg 50L", 50.0, "KEG"),
    new Product(102, "Wine Box 10L", 10.0, "WINE"),
    new Product(103, "Vodka Bottle 1L", 1.0, "SPIRIT"),
    new Product(104, "Whiskey Bottle 0.7L", 0.7, "SPIRIT")
  ], 4),

  // Updated product
  updatedProduct: new Product(101, "Beer Keg 50L", 50.0, "KEG"),

  // Suppliers
  suppliers: new SupplierListResponse([
    new Supplier(10, "Acme Drinks", "contact@acmedrinks.com"),
    new Supplier(11, "Beverage World", "orders@beverageworld.com"),
    new Supplier(12, "Liquor Distributors", "info@liquordist.com")
  ], 3),

  // New supplier
  newSupplier: new Supplier(11, "New Supplier", "new.supplier@example.com", "2025-11-13T10:00:00Z"),

  // Bars
  bars: new BarListResponse([
    new Bar(1, "Main Bar"),
    new Bar(2, "Cellar"),
    new Bar(3, "Terrace Bar"),
    new Bar(4, "VIP Lounge")
  ], 4),

  // Updated bar
  updatedBar: new Bar(1, "Main Bar - Updated"),

  // Stocks
  stocks: new StockResponse(
    1,
    "Main Bar",
    600.0,
    [
      new StockItem(5001, 1, 101, 150.0, "2025-11-13T09:30:00Z"),
      new StockItem(5002, 1, 102, 300.0, "2025-11-13T08:30:00Z"),
      new StockItem(5003, 2, 103, 75.0, "2025-11-13T07:15:00Z"),
      new StockItem(5004, 2, 101, 100.0, "2025-11-13T10:30:00Z"),
      new StockItem(5005, 3, 104, 35.0, "2025-11-13T06:45:00Z"),
      new StockItem(5006, 1, 103, 25.0, "2025-11-13T11:20:00Z")
    ],
    6
  ),

  // Updated stock
  updatedStock: new StockItem(5001, 1, 101, 150.0, "2025-11-13T09:30:00Z"),

  // Deliveries
  deliveries: new DeliveryListResponse([
    new Delivery(
      321,
      "2025-11-13T08:00:00Z",
      new Supplier(10, "Acme Drinks", "contact@acmedrinks.com"),
      [
        new DeliveryProduct(101, "Beer Keg 50L", 50.0, "KEG")
      ],
      "f92fa624-1111-4444-9999-1234567890ab",
      "04a58c32-2222-5555-aaaa-abcdefabcdef"
    ),
    new Delivery(
      322,
      "2025-11-12T14:30:00Z",
      new Supplier(11, "Beverage World", "orders@beverageworld.com"),
      [
        new DeliveryProduct(102, "Wine Box 10L", 10.0, "WINE"),
        new DeliveryProduct(103, "Vodka Bottle 1L", 1.0, "SPIRIT")
      ],
      "a1b2c3d4-5678-90ab-cdef-1234567890ab",
      "b2c3d4e5-6789-01bc-def1-234567890abc"
    )
  ], 2),

  // New delivery
  newDelivery: new Delivery(
    322,
    "2025-11-13T08:00:00Z",
    new Supplier(10, "Acme Drinks", "contact@acmedrinks.com"),
    [
      new DeliveryProduct(101, "Beer Keg 50L", 150.0, "KEG"),
      new DeliveryProduct(102, "Wine Box 10L", 50.0, "WINE")
    ],
    "f92fa624-1111-4444-9999-1234567890ab",
    "04a58c32-2222-5555-aaaa-abcdefabcdef"
  ),

  // Photos
  photo: new PhotoResponse(
    new Photo(
      "c7a0e54f-1234-4a2c-aaaa-42a42e42d111",
      "delivery_322_note.jpg",
      "image/jpeg",
      "https://cdn.example.com/photos/c7a0e54f-1234-4a2c-aaaa-42a42e42d111",
      "2025-11-13T07:59:15Z"
    )
  ),

  // Uploaded photo
  uploadedPhoto: new UploadPhotoResponse(
    new Photo(
      "c7a0e54f-1234-4a2c-aaaa-42a42e42d111",
      "delivery_322_note.jpg",
      "image/jpeg",
      "https://cdn.example.com/photos/c7a0e54f-1234-4a2c-aaaa-42a42e42d111",
      "2025-11-13T07:59:15Z"
    ),
    "c7a0e54f-1234-4a2c-aaaa-42a42e42d132"
  ),

  // OCR
  ocr: new OcrResponse(
    new Photo(
      "c7a0e54f-1234-4a2c-aaaa-42a42e42d111",
      "delivery_322_note.jpg",
      "image/jpeg",
      "https://cdn.example.com/photos/c7a0e54f-1234-4a2c-aaaa-42a42e42d111",
      "2025-11-13T07:59:15Z"
    ),
    "c7a0e54f-1234-4a2c-aaaa-42a42e42d132"
  ),

  // OCR Result
  ocrResult: new OcrResultResponse(
    new OcrResult(
      "Delivery note 322\nSupplier: Acme Drinks\nItems:\n- Beer Keg 50L x3\nTotal: 150L",
      {
        deliveryDate: "2025-11-13",
        supplierName: "Acme Drinks",
        products: [
          new OcrProduct("Beer Keg 50L", 50.0, 3, "Keg")
        ]
      }
    )
  )
};

// Enhanced data with stock calculations
const calculateProductStockTotals = () => {
  const stockItems = dummyData.stocks.items;
  const productStockMap = {};
  
  // Calculate total volume for each product across all bars
  stockItems.forEach(stock => {
    if (!productStockMap[stock.productId]) {
      productStockMap[stock.productId] = {
        totalVolume: 0
      };
    }
    productStockMap[stock.productId].totalVolume += stock.volume;
  });
  
  return productStockMap;
};

const productStockData = calculateProductStockTotals();

// Enhanced products with stock information
export const enhancedProducts = dummyData.products.items.map(product => {
  const stockInfo = productStockData[product.productId];
  const totalVolume = stockInfo ? stockInfo.totalVolume : 0;
  const bottleCount = stockInfo ? Math.floor(totalVolume / product.volume) : 0;
  
  return {
    ...product,
    totalVolume,
    bottleCount
  };
});

// Enhanced dummy data with products that include stock information
export const enhancedDummyData = {
  ...dummyData,
  products: {
    ...dummyData.products,
    items: enhancedProducts
  }
};

// Helper function to get product with stock info by ID
export const getProductWithStockInfo = (productId) => {
  return enhancedProducts.find(product => product.productId === productId);
};

export const getTotalStockForAllBars = () => {
  const stockItems = dummyData.stocks.items;
  const productStockMap = {};
  
  stockItems.forEach(stock => {
    if (!productStockMap[stock.productId]) {
      productStockMap[stock.productId] = {
        totalVolume: 0,
        product: dummyData.products.items.find(p => p.productId === stock.productId)
      };
    }
    productStockMap[stock.productId].totalVolume += stock.volume;
  });
  
  return Object.values(productStockMap).map(stockInfo => ({
    ...stockInfo.product,
    totalVolume: stockInfo.totalVolume,
    bottleCount: Math.floor(stockInfo.totalVolume / stockInfo.product.volume)
  }));
};

// Get stock for specific bar (for bar detail page)
export const getStockForBar = (barId) => {
  const barStocks = dummyData.stocks.items.filter(stock => stock.storagePlaceId === barId);
  const productStockMap = {};
  
  barStocks.forEach(stock => {
    if (!productStockMap[stock.productId]) {
      productStockMap[stock.productId] = {
        totalVolume: 0,
        product: dummyData.products.items.find(p => p.productId === stock.productId)
      };
    }
    productStockMap[stock.productId].totalVolume += stock.volume;
  });
  
  return Object.values(productStockMap).map(stockInfo => ({
    ...stockInfo.product,
    totalVolume: stockInfo.totalVolume,
    bottleCount: Math.floor(stockInfo.totalVolume / stockInfo.product.volume)
  }));
};


// Export individual classes and dummy data
export default dummyData;