import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (_req, file, cb) {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, 'uploads/imports'); // Ensure this folder exists
    } else {
      cb(null, 'uploads/profile_images'); // Ensure this folder exists
    }
  },
  filename: function (_req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

export const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedImageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const allowedExcelMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];

    const allowedImageExts = ['.jpg', '.jpeg', '.png'];
    const allowedExcelExts = ['.xls', '.xlsx'];

    const ext = path.extname(file.originalname).toLowerCase();
    const isImage = allowedImageMimeTypes.includes(file.mimetype) && allowedImageExts.includes(ext);
    const isExcel = allowedExcelMimeTypes.includes(file.mimetype) && allowedExcelExts.includes(ext);

    if (isImage || isExcel) {
      return cb(null, true);
    }

    cb(new Error('Only image or Excel files are allowed'));
  }
});




// Migration Plan (High-Level)
// Step 1: Replace multer.diskStorage with multer.memoryStorage
// Instead of writing to disk:
// export const upload = multer({ storage: multer.memoryStorage() });******
// This keeps the file in memory (as req.file.buffer) instead of saving locally.



// Step 2: Install Azure Blob SDK 
// npm install @azure/storage-blob ********




// Step 3: Upload to Azure Blob in Controller
//*********** */
// import { BlobServiceClient } from '@azure/storage-blob';

// const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
// const containerName = 'profile-images';

// const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
// const containerClient = blobServiceClient.getContainerClient(containerName);
//*********** */

// Then inside your create controller:
//*********** */
// if (req.file) {
//   const blobName = `${Date.now()}-${req.file.originalname}`;
//   const blockBlobClient = containerClient.getBlockBlobClient(blobName);
//   await blockBlobClient.uploadData(req.file.buffer, {
//     blobHTTPHeaders: { blobContentType: req.file.mimetype },
//   });

//   value.profile_image = blockBlobClient.url; // store public blob URL
// }
//*********** */
