
# Ski School OS - Internationalization Migration Guide

This guide explains how to migrate existing data to the new bilingual structure.

## 1. Database Schema Update
Run the contents of `i18n_schema_migration.sql` in your Supabase SQL Editor.
This will:
- Add `_en` and `_zh` columns to all content tables.
- Backfill existing data into the `_en` and `_zh` columns (assuming current content is English).

## 2. API Endpoints
All public API endpoints now support a `?lang=zh` query parameter.
- Default is `en`.
- Tenants should update their widget integration code to pass the correct language.

## 3. Frontend Routing
The application now uses a dynamic route segment `/[lang]`.
- Old routes (e.g., `/dashboard`) should redirect to `/[default_lang]/dashboard`.
- Middleware should be updated to handle this redirection (not fully implemented in this MVP output but recommended).

## 4. Content Entry
Admins must now enter data in both languages via the Admin Portal.
- The UI forms need to be updated to show dual input fields for `Name (EN)` and `Name (ZH)`.

## 5. Adding New Languages
To add a new language (e.g., Japanese `ja`):
1. Add `ja` to `src/i18n/settings.ts`.
2. Create `src/locales/ja.json`.
3. Add `_ja` columns to the database schema.
4. Update API handlers to map `_ja` fields.
