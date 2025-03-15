import { BlobServiceClient } from "@azure/storage-blob";

const storageAccount = "ipteam6csvstorage";
const containerName = "csv-uploads";

// the current key is valid until whatever the date is
// so in this case 2025-03-20 so the 20th of march
// i'm doing this manually so far so it's only valid for up to 7 days at a time
const sasToken = "se=2025-03-20&sp=rwdl&sv=2022-11-02&sr=c&skoid=cb7054dc-3019-41f6-8834-d19550896ce9&sktid=67bda7ee-fd80-41ef-ac91-358418290a1e&skt=2025-03-15T21%3A28%3A07Z&ske=2025-03-20T00%3A00%3A00Z&sks=b&skv=2022-11-02&sig=OLX7qqQ64sXuVlgefDwxrv47MTspYenRDxGNNQLZ8bk%3D";

const blobServiceClient = new BlobServiceClient(
  `https://${storageAccount}.blob.core.windows.net${sasToken}`
);
const containerClient = blobServiceClient.getContainerClient(containerName);

export async function uploadCSV(data, filename) {
  // I'm not sure what form the data is but if you want you can just modify
  // the function so that it passes the csvContent to the function
  const csvContent = [
    Object.keys(data[0]).join(","),
    ...data.map(row => Object.values(row).join(","))
  ].join("\n");

  const blobName = `${filename}-${Date.now()}.csv`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  // this is the bit that uploads the csv
  await blockBlobClient.upload(csvContent, csvContent.length);
  console.log(`Uploaded ${blobName} to Azure Blob Storage`);
  return blobName;
}
