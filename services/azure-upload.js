import { BlobServiceClient } from '@azure/storage-blob';
const CONNECTION_STRING = require('../config/keys');
const mime = require('mime-types');

export const azureUpload = async (image, imageName) => {
  // Create the BlobServiceClient object which will be used to create a container client
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    CONNECTION_STRING
  );
  console.log('[azureUpload]', image);

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
  const data = image;
  const blobOptions = {
    blobHTTPHeaders: { blobContentType: mime.lookup(imageName) }
  };
  blockBlobClient.uploadStream(data, undefined, undefined, blobOptions);
  // const uploadBlobResponse = await blockBlobClient.uploadStream(
  //   data,
  //   undefined,
  //   undefined,
  //   blobOptions
  // );
  // console.log(
  //   'Blob was uploaded successfully. requestId: ',
  //   uploadBlobResponse.requestId
  // );
};
