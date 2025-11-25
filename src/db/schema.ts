import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// User table (Better Auth compatibility)
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('user'),
  created_at: integer('created_at').notNull(),
  updated_at: integer('updated_at').notNull(),
});

// Houses table
export const houses = sqliteTable('houses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: text('user_id').references(() => user.id).notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zip_code: text('zip_code').notNull(),
  status: text('status').notNull().default('pending'),
  photos_urls: text('photos_urls', { mode: 'json' }),
  documents_urls: text('documents_urls', { mode: 'json' }),
  plan_url: text('plan_url'),
  plan_analysis: text('plan_analysis', { mode: 'json' }),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});

// Blog posts table
export const blogPosts = sqliteTable('blog_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content'),
  image_url: text('image_url'),
  author_id: text('author_id'),
  author_name: text('author_name').notNull(),
  category: text('category'),
  status: text('status').notNull().default('draft'),
  views: integer('views').notNull().default(0),
  published_at: text('published_at'),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
});