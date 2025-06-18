import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'

// =============================================================================
// ENUMS
// =============================================================================

export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'customer'])
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'suspended'])
export const productStatusEnum = pgEnum('product_status', [
  'draft',
  'active',
  'inactive',
  'archived',
])
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
])
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
])
export const paymentMethodEnum = pgEnum('payment_method', [
  'credit_card',
  'debit_card',
  'paypal',
  'stripe',
  'bank_transfer',
])
export const shippingStatusEnum = pgEnum('shipping_status', [
  'pending',
  'processing',
  'shipped',
  'in_transit',
  'delivered',
  'returned',
])
export const inventoryStatusEnum = pgEnum('inventory_status', [
  'in_stock',
  'low_stock',
  'out_of_stock',
  'discontinued',
])
export const notificationTypeEnum = pgEnum('notification_type', [
  'info',
  'warning',
  'error',
  'success',
])
export const activityTypeEnum = pgEnum('activity_type', [
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'order',
  'payment',
])

// =============================================================================
// CORE USER TABLES
// =============================================================================

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    username: text('username').unique(),
    fullName: text('full_name'),
    companyName: text('company_name'),
    role: userRoleEnum('role').default('customer'),
    status: userStatusEnum('status').default('active'),
    avatarUrl: text('avatar_url'),
    phone: text('phone'),
    dateOfBirth: timestamp('date_of_birth'),
    preferences: jsonb('preferences').default('{}'),
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    emailIdx: index('users_email_idx').on(table.email),
    roleIdx: index('users_role_idx').on(table.role),
    statusIdx: index('users_status_idx').on(table.status),
  })
)

export const userSessions = pgTable(
  'user_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    sessionToken: text('session_token').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    userIdIdx: index('user_sessions_user_id_idx').on(table.userId),
    tokenIdx: index('user_sessions_token_idx').on(table.sessionToken),
  })
)

// =============================================================================
// PRODUCT MANAGEMENT TABLES
// =============================================================================

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    parentId: uuid('parent_id').references(() => categories.id),
    imageUrl: text('image_url'),
    isActive: boolean('is_active').default(true),
    sortOrder: integer('sort_order').default(0),
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    slugIdx: index('categories_slug_idx').on(table.slug),
    parentIdIdx: index('categories_parent_id_idx').on(table.parentId),
    activeIdx: index('categories_active_idx').on(table.isActive),
  })
)

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    shortDescription: text('short_description'),
    sku: text('sku').notNull().unique(),
    barcode: text('barcode'),
    status: productStatusEnum('status').default('draft'),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
    costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
    weight: decimal('weight', { precision: 8, scale: 3 }),
    dimensions: jsonb('dimensions').default('{}'), // {length, width, height}
    images: jsonb('images').default('[]'), // Array of image URLs
    tags: jsonb('tags').default('[]'), // Array of tags
    attributes: jsonb('attributes').default('{}'), // Custom attributes
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    seoKeywords: text('seo_keywords'),
    isDigital: boolean('is_digital').default(false),
    requiresShipping: boolean('requires_shipping').default(true),
    trackInventory: boolean('track_inventory').default(true),
    allowBackorder: boolean('allow_backorder').default(false),
    createdBy: uuid('created_by').references(() => users.id),
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    slugIdx: index('products_slug_idx').on(table.slug),
    skuIdx: index('products_sku_idx').on(table.sku),
    statusIdx: index('products_status_idx').on(table.status),
    createdByIdx: index('products_created_by_idx').on(table.createdBy),
    nameIdx: index('products_name_idx').on(table.name),
  })
)

export const productCategories = pgTable(
  'product_categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    productCategoryUnique: unique('product_category_unique').on(table.productId, table.categoryId),
    productIdIdx: index('product_categories_product_id_idx').on(table.productId),
    categoryIdIdx: index('product_categories_category_id_idx').on(table.categoryId),
  })
)

export const productImages = pgTable(
  'product_images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    altText: text('alt_text'),
    sortOrder: integer('sort_order').default(0),
    isMain: boolean('is_main').default(false),
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    productIdIdx: index('product_images_product_id_idx').on(table.productId),
    sortOrderIdx: index('product_images_sort_order_idx').on(table.sortOrder),
  })
)

// =============================================================================
// INVENTORY MANAGEMENT TABLES
// =============================================================================

export const warehouses = pgTable(
  'warehouses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    code: text('code').notNull().unique(),
    address: jsonb('address').default('{}'), // {street, city, state, country, zipCode}
    isActive: boolean('is_active').default(true),
    isDefault: boolean('is_default').default(false),
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    codeIdx: index('warehouses_code_idx').on(table.code),
    activeIdx: index('warehouses_active_idx').on(table.isActive),
  })
)

export const inventory = pgTable(
  'inventory',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
    warehouseId: uuid('warehouse_id').references(() => warehouses.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').default(0),
    reservedQuantity: integer('reserved_quantity').default(0),
    reorderPoint: integer('reorder_point').default(0),
    reorderQuantity: integer('reorder_quantity').default(0),
    status: inventoryStatusEnum('status').default('in_stock'),
    lastRestocked: timestamp('last_restocked'),
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    productWarehouseUnique: unique('product_warehouse_unique').on(
      table.productId,
      table.warehouseId
    ),
    productIdIdx: index('inventory_product_id_idx').on(table.productId),
    warehouseIdIdx: index('inventory_warehouse_id_idx').on(table.warehouseId),
    statusIdx: index('inventory_status_idx').on(table.status),
  })
)

// =============================================================================
// ORDER MANAGEMENT TABLES
// =============================================================================

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: text('order_number').notNull().unique(),
    customerId: uuid('customer_id').references(() => users.id),
    status: orderStatusEnum('status').default('pending'),
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
    taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0'),
    shippingAmount: decimal('shipping_amount', { precision: 10, scale: 2 }).default('0'),
    discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').default('USD'),
    billingAddress: jsonb('billing_address').default('{}'),
    shippingAddress: jsonb('shipping_address').default('{}'),
    customerNotes: text('customer_notes'),
    internalNotes: text('internal_notes'),
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    orderNumberIdx: index('orders_order_number_idx').on(table.orderNumber),
    customerIdIdx: index('orders_customer_id_idx').on(table.customerId),
    statusIdx: index('orders_status_idx').on(table.status),
    createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
  })
)

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').references(() => products.id),
    quantity: integer('quantity').notNull(),
    unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
    totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
    productSnapshot: jsonb('product_snapshot').default('{}'), // Product data at time of order
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    orderIdIdx: index('order_items_order_id_idx').on(table.orderId),
    productIdIdx: index('order_items_product_id_idx').on(table.productId),
  })
)

// =============================================================================
// PAYMENT TABLES
// =============================================================================

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').default('USD'),
    status: paymentStatusEnum('status').default('pending'),
    method: paymentMethodEnum('method').notNull(),
    transactionId: text('transaction_id'),
    gatewayResponse: jsonb('gateway_response').default('{}'),
    processedAt: timestamp('processed_at'),
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    orderIdIdx: index('payments_order_id_idx').on(table.orderId),
    statusIdx: index('payments_status_idx').on(table.status),
    transactionIdIdx: index('payments_transaction_id_idx').on(table.transactionId),
  })
)

// =============================================================================
// SHIPPING TABLES
// =============================================================================

export const shippingMethods = pgTable(
  'shipping_methods',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    estimatedDays: integer('estimated_days'),
    isActive: boolean('is_active').default(true),
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    activeIdx: index('shipping_methods_active_idx').on(table.isActive),
  })
)

export const shipments = pgTable(
  'shipments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }),
    shippingMethodId: uuid('shipping_method_id').references(() => shippingMethods.id),
    trackingNumber: text('tracking_number'),
    carrier: text('carrier'),
    status: shippingStatusEnum('status').default('pending'),
    shippedAt: timestamp('shipped_at'),
    deliveredAt: timestamp('delivered_at'),
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    orderIdIdx: index('shipments_order_id_idx').on(table.orderId),
    trackingNumberIdx: index('shipments_tracking_number_idx').on(table.trackingNumber),
    statusIdx: index('shipments_status_idx').on(table.status),
  })
)

// =============================================================================
// MULTILINGUAL SUPPORT TABLES
// =============================================================================

export const languages = pgTable(
  'languages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: text('code').notNull().unique(), // e.g., 'en', 'es', 'fr'
    name: text('name').notNull(), // e.g., 'English', 'Español', 'Français'
    nativeName: text('native_name').notNull(), // e.g., 'English', 'Español', 'Français'
    isActive: boolean('is_active').default(true),
    isDefault: boolean('is_default').default(false),
    isRtl: boolean('is_rtl').default(false),
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    codeIdx: index('languages_code_idx').on(table.code),
    activeIdx: index('languages_active_idx').on(table.isActive),
  })
)

export const translations = pgTable(
  'translations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    languageId: uuid('language_id').references(() => languages.id, { onDelete: 'cascade' }),
    entityType: text('entity_type').notNull(), // 'product', 'category', etc.
    entityId: uuid('entity_id').notNull(),
    field: text('field').notNull(), // 'name', 'description', etc.
    value: text('value').notNull(),
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    entityIdx: index('translations_entity_idx').on(table.entityType, table.entityId),
    languageEntityUnique: unique('language_entity_field_unique').on(
      table.languageId,
      table.entityType,
      table.entityId,
      table.field
    ),
  })
)

// =============================================================================
// AI CONTENT GENERATION TABLES
// =============================================================================

export const aiGenerationJobs = pgTable(
  'ai_generation_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    entityType: text('entity_type').notNull(), // 'product', 'category', etc.
    entityId: uuid('entity_id'),
    jobType: text('job_type').notNull(), // 'description', 'translation', 'seo', etc.
    prompt: text('prompt').notNull(),
    result: text('result'),
    status: text('status').default('pending'), // 'pending', 'processing', 'completed', 'failed'
    tokensUsed: integer('tokens_used'),
    model: text('model'),
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    completedAt: timestamp('completed_at'),
  },
  table => ({
    userIdIdx: index('ai_generation_jobs_user_id_idx').on(table.userId),
    entityIdx: index('ai_generation_jobs_entity_idx').on(table.entityType, table.entityId),
    statusIdx: index('ai_generation_jobs_status_idx').on(table.status),
  })
)

// =============================================================================
// SYSTEM TABLES
// =============================================================================

export const activityLogs = pgTable(
  'activity_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    entityType: text('entity_type'), // 'product', 'order', 'user', etc.
    entityId: uuid('entity_id'),
    action: activityTypeEnum('action').notNull(),
    description: text('description'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    userIdIdx: index('activity_logs_user_id_idx').on(table.userId),
    entityIdx: index('activity_logs_entity_idx').on(table.entityType, table.entityId),
    actionIdx: index('activity_logs_action_idx').on(table.action),
    createdAtIdx: index('activity_logs_created_at_idx').on(table.createdAt),
  })
)

export const systemSettings = pgTable(
  'system_settings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    key: text('key').notNull().unique(),
    value: jsonb('value').notNull(),
    description: text('description'),
    isPublic: boolean('is_public').default(false),
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    keyIdx: index('system_settings_key_idx').on(table.key),
    publicIdx: index('system_settings_public_idx').on(table.isPublic),
  })
)

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    message: text('message').notNull(),
    type: notificationTypeEnum('type').default('info'),
    isRead: boolean('is_read').default(false),
    actionUrl: text('action_url'),
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    readAt: timestamp('read_at'),
  },
  table => ({
    userIdIdx: index('notifications_user_id_idx').on(table.userId),
    isReadIdx: index('notifications_is_read_idx').on(table.isRead),
    typeIdx: index('notifications_type_idx').on(table.type),
    createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
  })
)

// =============================================================================
// CUSTOMER SUPPORT TABLES
// =============================================================================

export const supportTickets = pgTable(
  'support_tickets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ticketNumber: text('ticket_number').notNull().unique(),
    customerId: uuid('customer_id').references(() => users.id),
    assignedToId: uuid('assigned_to_id').references(() => users.id),
    subject: text('subject').notNull(),
    description: text('description').notNull(),
    status: text('status').default('open'), // 'open', 'in_progress', 'resolved', 'closed'
    priority: text('priority').default('medium'), // 'low', 'medium', 'high', 'urgent'
    category: text('category'), // 'technical', 'billing', 'general', etc.
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    resolvedAt: timestamp('resolved_at'),
  },
  table => ({
    ticketNumberIdx: index('support_tickets_ticket_number_idx').on(table.ticketNumber),
    customerIdIdx: index('support_tickets_customer_id_idx').on(table.customerId),
    assignedToIdIdx: index('support_tickets_assigned_to_id_idx').on(table.assignedToId),
    statusIdx: index('support_tickets_status_idx').on(table.status),
    priorityIdx: index('support_tickets_priority_idx').on(table.priority),
  })
)

export const supportTicketMessages = pgTable(
  'support_ticket_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ticketId: uuid('ticket_id').references(() => supportTickets.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id),
    message: text('message').notNull(),
    isInternal: boolean('is_internal').default(false),
    attachments: jsonb('attachments').default('[]'),
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    ticketIdIdx: index('support_ticket_messages_ticket_id_idx').on(table.ticketId),
    userIdIdx: index('support_ticket_messages_user_id_idx').on(table.userId),
    createdAtIdx: index('support_ticket_messages_created_at_idx').on(table.createdAt),
  })
)

// =============================================================================
// ANALYTICS TABLES
// =============================================================================

export const analyticsEvents = pgTable(
  'analytics_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    sessionId: text('session_id'),
    eventType: text('event_type').notNull(), // 'page_view', 'product_view', 'add_to_cart', etc.
    eventData: jsonb('event_data').default('{}'),
    url: text('url'),
    referrer: text('referrer'),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    metadata: jsonb('metadata').default('{}'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  table => ({
    userIdIdx: index('analytics_events_user_id_idx').on(table.userId),
    sessionIdIdx: index('analytics_events_session_id_idx').on(table.sessionId),
    eventTypeIdx: index('analytics_events_event_type_idx').on(table.eventType),
    createdAtIdx: index('analytics_events_created_at_idx').on(table.createdAt),
  })
)

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// User types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserSession = typeof userSessions.$inferSelect
export type NewUserSession = typeof userSessions.$inferInsert

// Product types
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type ProductCategory = typeof productCategories.$inferSelect
export type NewProductCategory = typeof productCategories.$inferInsert
export type ProductImage = typeof productImages.$inferSelect
export type NewProductImage = typeof productImages.$inferInsert

// Inventory types
export type Warehouse = typeof warehouses.$inferSelect
export type NewWarehouse = typeof warehouses.$inferInsert
export type Inventory = typeof inventory.$inferSelect
export type NewInventory = typeof inventory.$inferInsert

// Order types
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert

// Payment types
export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert

// Shipping types
export type ShippingMethod = typeof shippingMethods.$inferSelect
export type NewShippingMethod = typeof shippingMethods.$inferInsert
export type Shipment = typeof shipments.$inferSelect
export type NewShipment = typeof shipments.$inferInsert

// Multilingual types
export type Language = typeof languages.$inferSelect
export type NewLanguage = typeof languages.$inferInsert
export type Translation = typeof translations.$inferSelect
export type NewTranslation = typeof translations.$inferInsert

// AI types
export type AiGenerationJob = typeof aiGenerationJobs.$inferSelect
export type NewAiGenerationJob = typeof aiGenerationJobs.$inferInsert

// System types
export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert
export type SystemSetting = typeof systemSettings.$inferSelect
export type NewSystemSetting = typeof systemSettings.$inferInsert
export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert

// Support types
export type SupportTicket = typeof supportTickets.$inferSelect
export type NewSupportTicket = typeof supportTickets.$inferInsert
export type SupportTicketMessage = typeof supportTicketMessages.$inferSelect
export type NewSupportTicketMessage = typeof supportTicketMessages.$inferInsert

// Analytics types
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert
