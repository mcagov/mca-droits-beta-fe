import { BlobServiceClient } from '@azure/storage-blob';
const CONNECTION_STRING = require('../config/keys');
import { v4 as uuidv4 } from 'uuid';

export const imageUpload = async (image) => {
  // Create the BlobServiceClient object which will be used to create a container client
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    CONNECTION_STRING
  );
  console.log('[imageUpload]', image);

  // Container name
  const containerName = 'report-uploads';

  // Get a reference to a container
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Create a unique name for the blob
  const blobName = image.name + uuidv4();
  console.log(blobName);

  // Get a block blob client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  console.log('\nUploading to Azure storage as blob:\n\t', blobName);

  // Upload data to the blob
  // const data = image.data;
  // const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
  // console.log(
  //   'Blob was uploaded successfully. requestId: ',
  //   uploadBlobResponse.requestId
  // );
};
