import pandas as pd
import os

# Get the Excel file path
excel_file = 'ICD11-excel.xlsx'  # Change if your file is in a different location

# Check if file exists
if not os.path.exists(excel_file):
    print(f"Error: File '{excel_file}' not found in current directory!")
    print(f"Current directory: {os.getcwd()}")
    print("\nFiles in current directory:")
    for file in os.listdir('.'):
        if file.endswith('.xlsx') or file.endswith('.xls'):
            print(f"  - {file}")
    exit(1)

print(f"Reading file: {excel_file}")
print("=" * 60)

# Read first few rows to check structure
df = pd.read_excel(excel_file, nrows=5)

print("\n1. COLUMN NAMES:")
print("-" * 60)
for i, col in enumerate(df.columns, 1):
    print(f"  {i}. '{col}'")

print("\n2. SAMPLE DATA (First row):")
print("-" * 60)
first_row = df.iloc[0]
for col in df.columns:
    print(f"  {col}: {first_row[col]}")

print("\n3. CHECK FOR REQUIRED COLUMNS:")
print("-" * 60)

required_columns = [
    'Foundation URI',
    'Code',
    'Title',
    'ClassKind',
    'DepthInKind',
    'IsResidual',
    'IsLeaf',
    'ChapterNo',
    'BlockId'
]

for col in required_columns:
    if col in df.columns:
        print(f"  ✓ '{col}' - FOUND")
        # Show first few non-null values
        non_null = df[col].dropna()
        if len(non_null) > 0:
            print(f"      Sample values: {non_null.head(3).tolist()}")
    else:
        print(f"  ✗ '{col}' - NOT FOUND")

print("\n4. CHECK FOR ALTERNATIVE COLUMN NAMES:")
print("-" * 60)

# Look for case-insensitive matches
for col in df.columns:
    col_lower = col.lower()
    if 'leaf' in col_lower:
        print(f"  Found leaf-related column: '{col}'")
    if 'residual' in col_lower:
        print(f"  Found residual-related column: '{col}'")
    if 'depth' in col_lower:
        print(f"  Found depth-related column: '{col}'")
    if 'kind' in col_lower:
        print(f"  Found kind-related column: '{col}'")

print("\n5. DATA TYPES:")
print("-" * 60)
for col in df.columns:
    print(f"  {col}: {df[col].dtype}")

print("\n6. COUNT OF DIFFERENT ClassKind VALUES:")
print("-" * 60)
# Read all rows for this analysis
df_full = pd.read_excel(excel_file)
class_kind_counts = df_full['ClassKind'].value_counts()
for kind, count in class_kind_counts.items():
    print(f"  {kind}: {count}")

print("\n7. SAMPLE OF 'IsLeaf' COLUMN VALUES (first 10 non-null):")
print("-" * 60)
if 'IsLeaf' in df_full.columns:
    leaf_values = df_full['IsLeaf'].dropna().head(10)
    for val in leaf_values:
        print(f"  {val}")
else:
    print("  'IsLeaf' column not found in full dataset")
    # Check if there's a similar column
    for col in df_full.columns:
        if 'leaf' in col.lower():
            print(f"  Found alternative: '{col}'")
            leaf_values = df_full[col].dropna().head(10)
            for val in leaf_values:
                print(f"    {col}: {val}")

print("\n8. FILE LOCATION INFO:")
print("-" * 60)
print(f"  Current directory: {os.getcwd()}")
print(f"  Excel file path: {os.path.abspath(excel_file)}")
print(f"  File exists: {os.path.exists(excel_file)}")
print(f"  File size: {os.path.getsize(excel_file) if os.path.exists(excel_file) else 'N/A'} bytes")