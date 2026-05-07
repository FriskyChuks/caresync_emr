# icd11/management/commands/import_icd11.py

import pandas as pd
import re
from django.core.management.base import BaseCommand
from django.db import transaction
from icd11.models import ICD11Chapter, ICD11Block, ICD11Category, ICD11Grouping
import traceback

class Command(BaseCommand):
    help = 'Import ICD-11 data from Excel file'
    
    def add_arguments(self, parser):
        parser.add_argument('excel_file', type=str, help='Path to the ICD-11 Excel file')
        parser.add_argument('--clear', action='store_true', help='Clear existing data before import')
    
    def clean_title(self, title):
        """Remove leading hyphens and spaces from title"""
        if not title or pd.isna(title):
            return title
        
        title_str = str(title).strip()
        
        # Remove leading hyphens and spaces (one or more)
        # Pattern: starts with one or more hyphens followed by optional spaces
        cleaned = re.sub(r'^[-]+\s*', '', title_str)
        
        # Also handle cases with multiple hyphens and spaces in between
        # Example: "- - Bacterial intestinal infections" -> "Bacterial intestinal infections"
        cleaned = re.sub(r'^([-]\s*)+', '', cleaned)
        
        # Clean up any extra spaces
        cleaned = ' '.join(cleaned.split())
        
        return cleaned
    
    def handle(self, *args, **options):
        excel_file = options['excel_file']
        clear_existing = options['clear']
        
        self.stdout.write(f'Starting ICD-11 import from {excel_file}...')
        
        if clear_existing:
            self.stdout.write('Clearing existing ICD-11 data...')
            ICD11Grouping.objects.all().delete()
            ICD11Category.objects.all().delete()
            ICD11Block.objects.all().delete()
            ICD11Chapter.objects.all().delete()
            self.stdout.write('Existing data cleared.')
        
        try:
            # Load the Excel file
            self.stdout.write('Loading Excel file...')
            df = pd.read_excel(excel_file)
            
            # Standardize column names
            df.columns = df.columns.str.strip()
            
            # Handle NaN values
            df = df.where(pd.notna(df), None)
            
            self.stdout.write(f'Loaded {len(df)} rows')
            
            # Store created objects for lookup
            chapters = {}
            blocks = {}
            
            # FIRST PASS: Create chapters
            self.stdout.write('\n=== Creating Chapters ===')
            chapter_count = 0
            
            df_chapters = df[df['ClassKind'] == 'chapter']
            self.stdout.write(f'Found {len(df_chapters)} chapters')
            
            for idx, row in df_chapters.iterrows():
                try:
                    chapter_no = str(row['ChapterNo']) if row['ChapterNo'] is not None else ''
                    
                    # Clean title for chapters too (though they usually don't have hyphens)
                    clean_title = self.clean_title(row['Title'])
                    
                    chapter = ICD11Chapter.objects.create(
                        code=row.get('Code') if pd.notna(row.get('Code')) else '',
                        title=clean_title,
                        chapter_no=chapter_no,
                        chapter_order=int(row['ChapterNo']) if row['ChapterNo'] is not None else None
                    )
                    chapters[chapter_no] = chapter
                    chapter_count += 1
                    
                    if chapter_count % 10 == 0:
                        self.stdout.write(f'  Created {chapter_count} chapters...')
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'  Error at row {idx}: {e}'))
                    continue
            
            self.stdout.write(self.style.SUCCESS(f'✓ Created {chapter_count} chapters'))
            
            # SECOND PASS: Create blocks
            self.stdout.write('\n=== Creating Blocks ===')
            block_count = 0
            
            df_blocks = df[df['ClassKind'] == 'block']
            self.stdout.write(f'Found {len(df_blocks)} blocks')
            
            # Process blocks in order of depth
            df_blocks_sorted = df_blocks.sort_values('DepthInKind')
            
            for idx, row in df_blocks_sorted.iterrows():
                try:
                    # Find the chapter
                    chapter_no = str(row['ChapterNo']) if row['ChapterNo'] is not None else ''
                    chapter = chapters.get(chapter_no)
                    
                    if not chapter:
                        self.stdout.write(f'  Warning: Could not find chapter for block {row.get("Title", "")}')
                        continue
                    
                    # Clean title for block
                    clean_title = self.clean_title(row['Title'])
                    
                    # Create block
                    block_id = row['BlockId'] if row['BlockId'] is not None else f"BLOCK_{idx}"
                    block = ICD11Block.objects.create(
                        block_id=block_id,
                        title=clean_title,
                        chapter=chapter,
                        depth_in_kind=int(row['DepthInKind']) if row['DepthInKind'] is not None else 1,
                        is_residual=bool(row.get('IsResidual', False)) if row.get('IsResidual') is not None else False
                    )
                    blocks[block.block_id] = block
                    block_count += 1
                    
                    if block_count % 100 == 0:
                        self.stdout.write(f'  Created {block_count} blocks...')
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'  Error at row {idx}: {e}'))
                    continue
            
            self.stdout.write(self.style.SUCCESS(f'✓ Created {block_count} blocks'))
            
            # Update parent-child relationships for blocks
            self.stdout.write('\n=== Updating Block Parent Relationships ===')
            parent_update_count = 0
            
            for idx, row in df_blocks_sorted.iterrows():
                try:
                    block = blocks.get(row['BlockId'])
                    if block:
                        # Find parent from groupings
                        parent_block = None
                        for i in range(1, 6):
                            grouping_col = f'Grouping{i}'
                            if row.get(grouping_col) and pd.notna(row.get(grouping_col)):
                                parent_block = blocks.get(row[grouping_col])
                                if parent_block:
                                    break
                        
                        if parent_block and block.parent_block is None:
                            block.parent_block = parent_block
                            block.save()
                            parent_update_count += 1
                except Exception as e:
                    continue
            
            self.stdout.write(f'✓ Updated {parent_update_count} block parent relationships')
            
            # THIRD PASS: Create categories
            self.stdout.write('\n=== Creating Categories ===')
            category_count = 0
            error_count = 0
            duplicate_count = 0
            extension_code_count = 0
            
            df_categories = df[df['ClassKind'] == 'category'].copy()
            self.stdout.write(f'Found {len(df_categories)} categories')
            
            # Process in order of depth
            df_categories_sorted = df_categories.sort_values('DepthInKind')
            
            for idx, row in df_categories_sorted.iterrows():
                try:
                    code = row.get('Code')
                    if not code or pd.isna(code):
                        continue
                    
                    # Skip codes that are empty or just whitespace
                    code = str(code).strip()
                    if not code:
                        continue
                    
                    # Check if this is an extension code (starts with X, Y, Z)
                    is_extension_code = code[0] in ['X', 'Y', 'Z'] if code else False
                    
                    if is_extension_code:
                        extension_code_count += 1
                        if extension_code_count <= 5:
                            self.stdout.write(f'  Skipping extension code: {code}')
                        continue
                    
                    # Find the chapter
                    chapter_no = str(row['ChapterNo']) if row['ChapterNo'] is not None else ''
                    chapter = chapters.get(chapter_no)
                    
                    if not chapter:
                        error_count += 1
                        if error_count <= 10:
                            self.stdout.write(f'  Warning: No chapter for {code}')
                        continue
                    
                    # Find associated block
                    block = None
                    for i in range(1, 6):
                        grouping_col = f'Grouping{i}'
                        if row.get(grouping_col) and pd.notna(row.get(grouping_col)):
                            block = blocks.get(row[grouping_col])
                            if block:
                                break
                    
                    # Find parent category based on depth
                    parent_category = None
                    depth = int(row.get('DepthInKind', 1)) if row.get('DepthInKind') is not None else 1
                    
                    # Only try to find parent if depth > 1 and code contains a dot
                    if depth > 1 and '.' in code:
                        parent_code = code.rsplit('.', 1)[0]
                        parent_category = ICD11Category.objects.filter(code=parent_code).first()
                    
                    # Get boolean values
                    is_leaf = False
                    if 'isLeaf' in row and row['isLeaf'] is not None:
                        is_leaf = bool(row['isLeaf'])
                    
                    is_residual = False
                    if 'IsResidual' in row and row['IsResidual'] is not None:
                        is_residual = bool(row['IsResidual'])
                    
                    # Clean title - remove leading hyphens
                    clean_title = self.clean_title(row['Title'])
                    
                    # Create category (without foundation_uri)
                    category, created = ICD11Category.objects.get_or_create(
                        code=code,
                        defaults={
                            'title': clean_title,
                            'chapter': chapter,
                            'block': block,
                            'parent_category': parent_category,
                            'depth_in_kind': depth,
                            'is_leaf': is_leaf,
                            'is_residual': is_residual
                        }
                    )
                    
                    if created:
                        category_count += 1
                        
                        # Create groupings
                        for i in range(1, 6):
                            grouping_col = f'Grouping{i}'
                            if row.get(grouping_col) and pd.notna(row.get(grouping_col)):
                                ICD11Grouping.objects.get_or_create(
                                    category=category,
                                    grouping_type=f'grouping{i}',
                                    grouping_value=row[grouping_col]
                                )
                        
                        if category_count % 1000 == 0:
                            self.stdout.write(f'  Created {category_count} categories...')
                    else:
                        duplicate_count += 1
                        
                except Exception as e:
                    error_count += 1
                    code_val = row.get('Code', 'Unknown')
                    if error_count <= 20:
                        self.stdout.write(self.style.ERROR(f'  Error with {code_val}: {str(e)[:100]}'))
                    continue
            
            self.stdout.write(self.style.SUCCESS(f'✓ Created {category_count} new categories'))
            self.stdout.write(f'   📝 Skipped {extension_code_count} extension codes (X, Y, Z prefixes)')
            self.stdout.write(f'   🔄 Skipped {duplicate_count} duplicates')
            
            if error_count > 0:
                self.stdout.write(self.style.WARNING(f'⚠️ {error_count} categories failed to import'))
            
            # Update leaf status
            self.stdout.write('\n=== Updating Leaf Status ===')
            with transaction.atomic():
                # Categories that have children should not be leaf
                categories_with_children = ICD11Category.objects.filter(children__isnull=False).distinct()
                updated_count = categories_with_children.filter(is_leaf=True).update(is_leaf=False)
                self.stdout.write(f'✓ Updated {updated_count} categories to non-leaf')
            
            # Show sample of cleaned titles
            self.stdout.write('\n=== Sample of Cleaned Titles ===')
            sample_categories = ICD11Category.objects.filter(depth_in_kind__lte=3)[:10]
            for cat in sample_categories:
                indent = '  ' * (cat.depth_in_kind - 1)
                self.stdout.write(f'{indent}{cat.code}: {cat.title}')
            
            # Summary
            self.stdout.write(self.style.SUCCESS('\n' + '='*60))
            self.stdout.write(self.style.SUCCESS('✅ ICD-11 DATA IMPORT COMPLETED SUCCESSFULLY!'))
            self.stdout.write(self.style.SUCCESS('='*60))
            self.stdout.write(f'   📚 Chapters: {ICD11Chapter.objects.count()}')
            self.stdout.write(f'   📦 Blocks: {ICD11Block.objects.count()}')
            self.stdout.write(f'   🏷️  Categories: {ICD11Category.objects.count()}')
            self.stdout.write(f'   🔗 Groupings: {ICD11Grouping.objects.count()}')
            self.stdout.write(f'   📝 Extension codes skipped: {extension_code_count}')
            self.stdout.write(f'   ⚠️  Errors: {error_count}')
            self.stdout.write('='*60)
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Import failed: {e}'))
            traceback.print_exc()