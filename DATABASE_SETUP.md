# Database Setup Guide

## Quick Start

After setting up the project, follow these steps to initialize the database:

### 1. Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your database connection
# DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### 2. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates tables)
npm run db:migrate

# Seed database with admin user and default settings
npm run db:seed
```

## Available Commands

| Command               | Description                        |
| --------------------- | ---------------------------------- |
| `npm run db:generate` | Generate Prisma client from schema |
| `npm run db:migrate`  | Run database migrations            |
| `npm run db:seed`     | Seed database with initial data    |
| `npm run studio`      | Open Prisma Studio (database GUI)  |

## What Gets Created

### Admin User

- **Email**: `admin@epic7optimizer.com`
- **Password**: `admin1234`
- **ID**: `admin-user`

### Default Settings

- Scoring weights for substats and main stats
- Threshold values for gear quality badges
- fScore configuration

## Database Schema

The database includes:

- **Users**: Authentication and user management
- **Gears**: Epic 7 gear items with stats
- **Heroes**: Epic 7 characters
- **SubStats**: Individual gear substats
- **StatTypes**: Reference data for stat types
- **GearSets**: Gear set definitions
- **Settings**: Application configuration

## Troubleshooting

### "Database connection failed"

- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify database exists and is accessible

### "Prisma client not generated"

- Run `npm run db:generate`
- Check for TypeScript errors in schema

### "Migration failed"

- Check database permissions
- Ensure schema is valid
- Try `npx prisma db push` as alternative

### "Admin login not working"

If you can't sign in with the default admin account:

1. Check that the database was seeded: `npm run db:seed`
2. Verify the admin user exists in the database
3. Ensure you're using exactly: `admin@epic7optimizer.com` / `admin1234`
4. Check for any whitespace in the password field
5. If issues persist, you can manually reset the password in Prisma Studio

### Manual Password Reset

If you need to reset the admin password manually:

1. Open Prisma Studio: `npm run studio`
2. Navigate to the Users table
3. Find the admin user
4. Update the password field with a new bcrypt hash
5. Or delete the user and re-run `npm run db:seed`

## Production Notes

- Change default admin password after first login
- Set secure `JWT_SECRET` in environment
- Use strong database passwords
- Consider database backups
