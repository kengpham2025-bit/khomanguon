CREATE TABLE `admin_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_id` text NOT NULL,
	`action` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text,
	`details` text,
	`ip` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `affiliate_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`referred_user_id` text NOT NULL,
	`deposit_id` text NOT NULL,
	`commission_amount` real NOT NULL,
	`deposit_amount` real NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`referred_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`deposit_id`) REFERENCES `deposits`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`product_id` text NOT NULL,
	`variant_id` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name_vi` text NOT NULL,
	`name_en` text NOT NULL,
	`slug` text NOT NULL,
	`icon` text NOT NULL,
	`description_vi` text,
	`description_en` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`parent_id` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`content` text NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`attachment_url` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `chat_rooms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `chat_rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`order_id` text,
	`buyer_id` text,
	`seller_id` text,
	`user_id` text,
	`last_message` text,
	`last_message_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `deposits` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`amount` real NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payos_order_code` text NOT NULL,
	`payos_transaction_no` text,
	`payos_payment_link_id` text,
	`payos_checkout_url` text,
	`referral_code` text,
	`affiliate_commission` real,
	`note` text,
	`created_at` integer NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `news_articles` (
	`id` text PRIMARY KEY NOT NULL,
	`title_vi` text NOT NULL,
	`title_en` text NOT NULL,
	`slug_vi` text NOT NULL,
	`slug_en` text NOT NULL,
	`excerpt_vi` text,
	`excerpt_en` text,
	`content_vi` text NOT NULL,
	`content_en` text NOT NULL,
	`author` text,
	`source_url` text,
	`cover_image` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `news_articles_slug_vi_unique` ON `news_articles` (`slug_vi`);--> statement-breakpoint
CREATE UNIQUE INDEX `news_articles_slug_en_unique` ON `news_articles` (`slug_en`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`buyer_id` text NOT NULL,
	`seller_id` text NOT NULL,
	`product_id` text NOT NULL,
	`variant_id` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price` real NOT NULL,
	`total_price` real NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_method` text,
	`payment_id` text,
	`payos_transaction_no` text,
	`transfer_content` text,
	`delivered_at` integer,
	`completed_at` integer,
	`cancellation_reason` text,
	`dispute_reason` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `otp_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`code` text NOT NULL,
	`purpose` text NOT NULL,
	`expires_at` integer NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`is_used` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`seller_id` text NOT NULL,
	`category_id` text NOT NULL,
	`subcategory_id` text,
	`title_vi` text NOT NULL,
	`title_en` text NOT NULL,
	`slug_vi` text NOT NULL,
	`slug_en` text NOT NULL,
	`description_vi` text DEFAULT '' NOT NULL,
	`description_en` text DEFAULT '' NOT NULL,
	`demo_images` text DEFAULT '[]' NOT NULL,
	`download_links` text DEFAULT '[]' NOT NULL,
	`is_hot` integer DEFAULT false NOT NULL,
	`is_sale` integer DEFAULT false NOT NULL,
	`is_new` integer DEFAULT false NOT NULL,
	`rating` real DEFAULT 0 NOT NULL,
	`review_count` integer DEFAULT 0 NOT NULL,
	`sales` integer DEFAULT 0 NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`buyer_id` text NOT NULL,
	`seller_id` text NOT NULL,
	`rating` integer NOT NULL,
	`comment_vi` text,
	`comment_en` text,
	`is_visible` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `seo_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`page_key` text NOT NULL,
	`title_vi` text,
	`title_en` text,
	`description_vi` text,
	`description_en` text,
	`keywords_vi` text,
	`keywords_en` text,
	`og_image` text,
	`canonical_url` text,
	`json_ld_schema` text,
	`no_index` integer DEFAULT false NOT NULL,
	`no_follow` integer DEFAULT false NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `seo_settings_page_key_unique` ON `seo_settings` (`page_key`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`clerk_id` text NOT NULL,
	`email` text NOT NULL,
	`username` text,
	`full_name` text,
	`avatar_url` text,
	`balance` real DEFAULT 0 NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`language` text DEFAULT 'vi' NOT NULL,
	`referral_code` text NOT NULL,
	`referred_by` text,
	`kyc_status` text DEFAULT 'none' NOT NULL,
	`kyc_cccd_front` text,
	`kyc_cccd_back` text,
	`kyc_cccd_number` text,
	`kyc_submitted_at` integer,
	`bank_name` text,
	`bank_code` text,
	`bank_account_number` text,
	`bank_account_holder` text,
	`is_affiliate_active` integer DEFAULT false NOT NULL,
	`total_earnings` real DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_clerk_id_unique` ON `users` (`clerk_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_referral_code_unique` ON `users` (`referral_code`);--> statement-breakpoint
CREATE TABLE `variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`label_vi` text NOT NULL,
	`label_en` text NOT NULL,
	`price` real NOT NULL,
	`original_price` real,
	`stock` integer DEFAULT 0 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `withdrawals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`amount` real NOT NULL,
	`bank_name` text NOT NULL,
	`bank_code` text NOT NULL,
	`account_number` text NOT NULL,
	`account_holder` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`admin_note` text,
	`processed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
