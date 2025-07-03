const fs = require('fs')
const path = require('path')

module.exports.saveFile = (oldPath, folder, filename) => {
    const dirPath = path.join('/mnt/ebs500/uploads', folder); // Your EBS-mounted uploads path
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    const newPath = path.join(dirPath, filename);
    const fileData = fs.readFileSync(oldPath);
    fs.writeFileSync(newPath, fileData);

    // Return relative public-facing path
    return `/uploads/${folder}/${filename}`;
}