/*
# Make review text columns nullable

- dog_name, breed, weight, size: change from NOT NULL to nullable with default ''
- This allows review forms to omit these fields
*/

ALTER TABLE reviews ALTER COLUMN dog_name DROP NOT NULL;
ALTER TABLE reviews ALTER COLUMN dog_name SET DEFAULT '';
ALTER TABLE reviews ALTER COLUMN breed DROP NOT NULL;
ALTER TABLE reviews ALTER COLUMN breed SET DEFAULT '';
ALTER TABLE reviews ALTER COLUMN weight DROP NOT NULL;
ALTER TABLE reviews ALTER COLUMN weight SET DEFAULT '';
ALTER TABLE reviews ALTER COLUMN size DROP NOT NULL;
ALTER TABLE reviews ALTER COLUMN size SET DEFAULT '';
