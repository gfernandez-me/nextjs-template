-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Insert default admin user
-- Password: admin1234 (hashed with bcrypt)
INSERT INTO "users" ("id", "name", "email", "password", "createdAt", "updatedAt")
VALUES (
    'admin-user',
    'Admin User',
    'admin@epic7optimizer.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5mO6O',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
