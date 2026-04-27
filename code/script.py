import re

file_path = "web/src/SuperAdminDashboard.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

seen = set()
new_lines = []

pattern = re.compile(r"const\s+\[(\w+),\s*(\w+)\]\s*=\s*useState")

for line in lines:
    match = pattern.search(line)
    
    if match:
        state_var = match.group(1)
        
        # If already seen, skip (remove duplicate)
        if state_var in seen:
            print(f"Removing duplicate: {line.strip()}")
            continue
        else:
            seen.add(state_var)

    new_lines.append(line)

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("✅ Duplicate state declarations removed successfully.")
