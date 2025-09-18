const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// 從命令列參數取得目標目錄和 CSV 檔案路徑
const targetDir = process.argv[2];
const inputCsv = process.argv[3];

if (!targetDir || !inputCsv) {
	console.error('❌ 錯誤：請提供目標目錄和翻譯檔案的路徑！');
	console.error('用法：node script.js <targetDir> <translationCsv>');
	process.exit(1); // 結束程式
}

// 逐行讀取 CSV
const rows = [];
fs.createReadStream(inputCsv)
	.pipe(csv({ headers: ['Zh', 'En'] })) // 明確欄位
	.on('data', (row) => {
		rows.push(row); // 收集每一行
	})
	.on('end', () => {
		console.log(`🔄 已讀取 ${rows.length} 筆數據，開始替換作業...`);
		processFiles(rows);
	})
	.on('error', (err) => {
		console.error(`❌ 讀取 CSV 發生錯誤：${err.message}`);
		process.exit(1); // 結束程式
	});

function processFiles(rows) {
	// 遞迴目錄，找到所有需要處理的檔案
	const targetFiles = getAllFiles(targetDir);
	console.log(`🔍 找到 ${targetFiles.length} 個檔案需要處理`);

	for (const file of targetFiles) {
		console.log(`正在處理檔案：${file}`);
		const content = fs.readFileSync(file, 'utf-8'); // 讀取檔案內容
		let updatedContent = content;

		// 依據 CSV 的規則，逐步對檔案內容進行替換
		for (const { Zh, En } of rows) {
			// 替換模式 1: DisplayName("${Zh}") → DisplayName("${En}"), Column("${Zh}")
			const regex1 = new RegExp(`DisplayName\\("${escapeRegExp(Zh)}"\\)`, 'g');
			updatedContent = updatedContent.replace(regex1, `DisplayName("${Zh}"), Column("${Zh}")`);

			// 替換模式 2: fields.${Zh}[ → fields.${En}[
			const regex2 = new RegExp(`fields\\.${escapeRegExp(Zh)}\\[`, 'g');
			updatedContent = updatedContent.replace(regex2, `fields.${En}[`);

			// 替換模式 3: ` ${Zh} ` → ` ${En} `
			const regex3 = new RegExp(`\\s${escapeRegExp(Zh)}\\s`, 'g');
			updatedContent = updatedContent.replace(regex3, ` ${En} `);
		}

		// 如果內容有更新才保存
		if (updatedContent !== content) {
			fs.writeFileSync(file, updatedContent, 'utf-8');
			console.log(`✅ 完成替換並保存檔案：${file}`);
		} else {
			console.log(`🔍 檔案未變更：${file}`);
		}
	}

	console.log('\n✅ 所有檔案已完成處理！');
}

// 取得目標目錄下的所有檔案
function getAllFiles(dir) {
	let results = [];
	const list = fs.readdirSync(dir);

	for (const file of list) {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat && stat.isDirectory()) {
			// 如果是目錄，遞迴進入子目錄
			results = results.concat(getAllFiles(filePath));
		} else if (stat && stat.isFile()) {
			// 如果是檔案，加入結果
			results.push(filePath);
		}
	}

	return results;
}

// 防止正規表達式中的特殊字元被误解析
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}