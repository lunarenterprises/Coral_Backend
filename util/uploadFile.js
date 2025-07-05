const fs = require('fs')
const path = require('path')


module.exports.saveFile = (oldPath, folder, filename) => {
    console.log(`📥 oldPath: ${oldPath}`);
    console.log(`📂 folder: ${folder}`);
    console.log(`📄 filename: ${filename}`);

    const dirPath = path.join('/mnt/ebs500/uploads', folder);
    console.log(`🛠️ Creating dir: ${dirPath}`);

    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    } catch (err) {
        console.error(`❌ mkdirSync failed: ${dirPath}`, err);
        throw err;
    }

    const newPath = path.join(dirPath, filename);
    console.log(`📝 Writing to: ${newPath}`);

    try {
        const fileData = fs.readFileSync(oldPath);
        fs.writeFileSync(newPath, fileData);
    } catch (err) {
        console.error(`❌ writeFileSync failed`, err);
        throw err;
    }

    return `/uploads/${folder}/${filename}`;
};
