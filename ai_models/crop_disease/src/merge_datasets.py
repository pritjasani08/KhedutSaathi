import os
import shutil
from pathlib import Path

def merge_datasets():
    # Base directory paths
    base_dir = Path(__file__).resolve().parent.parent
    
    master_dataset_dir = base_dir / "raw_datasets" / "MasterDataset"
    cotton_dataset_dir = base_dir / "raw_datasets" / "cotton"
    
    merged_dataset_dir = base_dir / "merged_dataset"
    merged_train_dir = merged_dataset_dir / "train"
    merged_val_dir = merged_dataset_dir / "val"
    
    # Create merged directories
    merged_train_dir.mkdir(parents=True, exist_ok=True)
    merged_val_dir.mkdir(parents=True, exist_ok=True)
    
    # Source directories
    master_train = master_dataset_dir / "train"
    master_val = master_dataset_dir / "val"
    
    cotton_train = cotton_dataset_dir / "Train"
    cotton_val = cotton_dataset_dir / "Validation"
    
    master_classes = set()
    cotton_classes = set()
    
    def copy_files(src_folder, dest_folder, source_name):
        if not src_folder.exists():
            print(f"Warning: Source folder {src_folder} does not exist.")
            return 0
        
        copied_count = 0
        for class_name in os.listdir(src_folder):
            class_src = src_folder / class_name
            if not class_src.is_dir():
                continue
                
            # Track classes added by each dataset
            if source_name == "MasterDataset":
                master_classes.add(class_name)
            else:
                cotton_classes.add(class_name)
                
            # Create class directory in the merged folder
            class_dest = dest_folder / class_name
            class_dest.mkdir(parents=True, exist_ok=True)
            
            # Copy all files
            for file_name in os.listdir(class_src):
                file_src = class_src / file_name
                if not file_src.is_file():
                    continue
                    
                file_dest = class_dest / file_name
                
                # Handle filename collisions (do not overwrite)
                counter = 1
                while file_dest.exists():
                    name, ext = os.path.splitext(file_name)
                    file_dest = class_dest / f"{name}_{counter}{ext}"
                    counter += 1
                    
                shutil.copy2(file_src, file_dest)
                copied_count += 1
                
        return copied_count

    print("Merging training datasets...")
    train_master_count = copy_files(master_train, merged_train_dir, "MasterDataset")
    train_cotton_count = copy_files(cotton_train, merged_train_dir, "Cotton")
    
    print("Merging validation datasets...")
    val_master_count = copy_files(master_val, merged_val_dir, "MasterDataset")
    val_cotton_count = copy_files(cotton_val, merged_val_dir, "Cotton")
    
    total_train = train_master_count + train_cotton_count
    total_val = val_master_count + val_cotton_count
    
    all_merged_classes = set()
    for d in [merged_train_dir, merged_val_dir]:
        if d.exists():
            for class_name in os.listdir(d):
                if (d / class_name).is_dir():
                    all_merged_classes.add(class_name)
                    
    print("\n==================================================")
    print("AFTER MERGING")
    print("==================================================")
    print(f"Total Classes: {len(all_merged_classes)}")
    print(f"Total Train Images: {total_train}")
    print(f"Total Validation Images: {total_val}")
    print(f"Classes Added From MasterDataset: {len(master_classes)}")
    print(f"Classes Added From Cotton Dataset: {len(cotton_classes)}")
    print("==================================================")

if __name__ == "__main__":
    merge_datasets()
