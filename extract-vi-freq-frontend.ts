import fs from 'fs';
import path from 'path';

const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []) => {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
};

const filePaths = getAllFiles(path.join(process.cwd(), 'app'));

const viRegex = /["'\`]+([^"'\`]*?[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ][^"'\`]*?)["'\`]+/gi;

const dictionary: Record<string, number> = {};

for (const filePath of filePaths) {
  const content = fs.readFileSync(filePath, 'utf8');
  let match;
  while ((match = viRegex.exec(content)) !== null) {
    const text = match[1];
    dictionary[text] = (dictionary[text] || 0) + 1;
  }
}

// Sort by frequency
const sortedDict = Object.entries(dictionary)
  .sort((a, b) => b[1] - a[1])
  .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

fs.writeFileSync('vi-strings-freq-frontend.json', JSON.stringify(sortedDict, null, 2));
console.log(`Found ${Object.keys(sortedDict).length} unique strings.`);
