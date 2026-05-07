# Run migrations to create tables
python manage.py migrate icd11

# Import data (without --clear for first time)
python manage.py import_icd11 icd11-excel.xlsx

# Note: No --clear flag for first import


# Option A: Update existing data (recommended for production)
python manage.py import_icd11 icd11-excel.xlsx --clear

# Option B: If you need to preserve old data and add new
# Don't use --clear, it will update existing and add new
python manage.py import_icd11 icd11-excel.xlsx