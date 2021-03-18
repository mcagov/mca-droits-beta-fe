import { BlobServiceClient } from '@azure/storage-blob';
import fs from 'fs';
const mime = require('mime-types');
const dotenv = require('dotenv');
dotenv.config();
export const azureUpload = async (image, imageName) => {
  // Create the BlobServiceClient object which will be used to create a container client
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );

  // Container name
  const containerName = 'report-uploads';

  // Get a reference to a container
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Create a unique name for the blob
  const blobName = imageName;

  // Get a block blob client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  console.log('\nUploading to Azure storage as blob:\n\t', blobName);

  // Upload data to the blob
  const blobOptions = {
    blobHTTPHeaders: { blobContentType: mime.lookup(imageName) },
  };

  const uploadBlobResponse = await blockBlobClient.uploadStream(
    image,
    undefined,
    undefined,
    blobOptions
  );
  console.log(
    '\nBlob was uploaded successfully. requestId: ',
    uploadBlobResponse.requestId
  );

  // Delete temp image from /uploads
  fs.unlink(image.path, (err) => {
    if (err) console.log(err);
    else {
      console.log(`\nDeleted file: ${imageName}`);
    }
  });
};
