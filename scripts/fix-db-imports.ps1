# 批量替换 Manager 文件中的 getDb() 调用

$files = @(
    "src\storage\database\roomManager.ts",
    "src\storage\database\tenantManager.ts",
    "src\storage\database\billManager.ts",
    "src\storage\database\paymentManager.ts",
    "src\storage\database\couponManager.ts",
    "src\storage\database\supermarketOrderManager.ts"
)

foreach ($file in $files) {
    $fullPath = "C:\D\租房用电商超通\$file"
    Write-Host "处理文件: $file"
    
    # 读取文件内容
    $content = Get-Content $fullPath -Raw -Encoding UTF8
    
    # 替换 import 语句
    $content = $content -replace 'import \{ getDb \} from "coze-coding-dev-sdk";', 'import { db } from "./index";'
    
    # 替换所有 const db = await getDb();
    $content = $content -replace 'const db = await getDb\(\);', '// db is imported from index'
    
    # 替换所有 const db = await getDb()
    $content = $content -replace 'const db = await getDb\(\)', '// db is imported from index'
    
    # 保存文件
    $content | Set-Content $fullPath -Encoding UTF8 -NoNewline
    
    Write-Host "✓ 完成: $file"
}

Write-Host "`n所有文件处理完成！"
