# serfix
Serenity 專案常會產生含有中文屬性名稱的類別（C#/TypeScript），本工具會依照對照表將「屬性名稱」以英文替換，但保留屬性的顯示名稱（DisplayName/標註文字）為中文，方便國際化與程式碼一致性，同時維持介面顯示的中文。
- 屬性命名：改為英文（依對照檔 translation.csv）
- DisplayName：維持中文（不會被英文化）

## 適用場景
- 你使用 Serenity 產生了表單/欄位/Row/Columns/Forms 等類別，其中某些屬性名稱是中文。
- 你希望：
    - 程式碼屬性改為英文，便於維護與團隊協作。
    - 顯示名稱仍顯示中文，不影響使用者介面。
    - 使用一份對照檔集中管理中英欄位名稱映射。

## 專案結構（摘要）
- index.js：主程式腳本
- translation.csv：中文→英文的對照表
- package.json：npm 腳本與相依
- node_modules：套件
- 其他資料：你的來源檔或示例資料

提示：請先使用版本控制（Git）或額外備份，避免批次處理造成不可逆變更。
## 安裝需求
- Node.js（建議 LTS 版本）
- npm（隨 Node.js 一起安裝）
- 已安裝套件：csv-parser 3.2.0（會在 npm install 時安裝）

## 安裝
``` bash
# 安裝相依套件
npm install
```
## 使用方式
最簡使用（在專案根目錄執行）：
``` bash
node index.js
```
常見做法：
- 在執行前準備或更新 translation.csv。
- 將欲處理的 Serenity 產出檔（例如：*.cs, *.ts）放在預期掃描的路徑中（通常是專案目錄或指定的來源資料夾）。
- 執行腳本後，工具會：
    1. 讀取 translation.csv 建立「中文 → 英文」映射。
    2. 掃描並找出含有中文屬性名稱的類別定義。
    3. 將屬性名稱改為英文。
    4. 若該屬性已有 DisplayName/顯示註解，保留中文；若沒有，則會以中文做 DisplayName（依實作可能新增或維持既有標註）。
    5. 輸出覆寫或另存（依實作而定）。

若你想要指定來源目錄、輸出目錄、啟用 dry-run 或備份等參數，請查看 index.js 內的說明或在命令列加上你在專案中已實作的選項。若尚未實作，可參考下方「進階建議」章節新增。
## 對照檔格式（translation.csv）
- 檔頭固定為：Zh,En
- 每列一組中文→英文的映射
- 範例（節錄）：
``` csv
Zh,En
單月化報表Id,MonthlyReportId
類別,Category
繳費週期,PaymentCycle
電號,ElectricityNumber
單位,Unit
成本中心,CostCenter
申請日期,ApplicationDate
關店日期,ClosureDate
...
```
規則與建議：
- 映射以完整匹配為準（建議避免前後空白，確保大小寫與全半形一致）。
- 英文命名建議使用 PascalCase 或 camelCase（視你的程式碼慣例）。
- 只處理屬性「名稱」，不會把 DisplayName 的中文改成英文。

## 處理規則摘要
- 會將類別「屬性名稱」中的中文換成對應英文（以 translation.csv 為主）。
- 不會把 DisplayName/顯示註解中的中文改掉；若需要顯示中文，會沿用或補齊中文 DisplayName。
- 僅處理「中文欄位名 → 英文屬性名」；對未在對照表中的中文欄位，預設不會更名（避免誤判）。
- 若同一中文出現多處，皆以同一英文替換，保持一致性。
- 對於非標準命名或動態生成的屬性，可能不會被自動處理（需人工確認）。

## 常見問題（FAQ）
- Q: 會不會改壞我的 DisplayName？
    - A: 不會。本工具的核心是「屬性名稱英文化」，DisplayName 仍使用中文。

- Q: 如果 translation.csv 沒有我需要的對照？
    - A: 請先在 translation.csv 補上對照，再重新執行。

- Q: 會不會改到非 Serenity 檔案？
    - A: 視你的掃描範圍而定；建議限制來源資料夾，或在腳本中加入檔案型別與目錄過濾。

- Q: 支援哪些檔案？
    - A: 一般針對 Serenity 常見產物（C#、TypeScript）有效；其他檔案類型依實作規則而定。

- Q: 有 dry-run 嗎？
    - A: 若目前未實作，建議新增（見下方進階建議）；先用 Git 做保險備份是必要的。

## 進階建議（可擴充）
可在 index.js 中（或以設定檔）加入下列選項與流程，提升安全性與可控性：
- 指定來源與輸出路徑：--src ./path/to/generated --out ./path/to/output
- 指定只處理的副檔名：--ext .cs,.ts
- 嚴格模式與忽略清單：--strict, --ignore "_/Migrations/_;_/bin/_;_/obj/_"
- 乾跑模式：--dry-run（只印出將會變更的清單，不寫檔）
- 自動備份：--backup（寫檔前建立 .bak）
- 報表輸出：--report report.json（輸出變更摘要、警告、未命中映射等）
- 命名規範轉換：自動轉 PascalCase 或 camelCase
- 衝突偵測：若檔案內已有同名英文屬性，先提示或改用別名

## 開發
``` bash
# 安裝依賴
npm install

# 執行（以 Node 執行主程式）
node index.js
```
建議在提交前以 Git 檢視差異：
``` bash
git add -A
git diff --staged
```