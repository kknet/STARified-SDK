import RNFetchBlob from 'rn-fetch-blob';

const getPathInDocuments = file => {
  const dirs = RNFetchBlob.fs.dirs;
  // never run this code on windows kek
  const result = dirs.DocumentDir + '/' + file;
  return result;
};

const purgeTempFiles = async () => {
  const files = ['_processed_mask.png', '_processed.png', 'input_img.png'];
  for (let i = 0; i < files.length; i++) {
    const path = getPathInDocuments(files[i]);
    const fileExist = await RNFetchBlob.fs.exists(path);

    if (fileExist) {
      await RNFetchBlob.fs.unlink(path);
    }
  }
};

const copyToDocuments = async (fileUri, newName) => {
  let newPath = RNFetchBlob.fs.dirs.DocumentDir + '/' + newName;
  const fileExist = await RNFetchBlob.fs.exists(newPath);

  if (fileExist) {
    await RNFetchBlob.fs.unlink(path);
  }

  let refineFileUri = fileUri;

  // RNFetchBlob doesn't work with file://
  if (refineFileUri.startsWith('file://')) {
    refineFileUri = refineFileUri.split('file://')[1];
  }
  return RNFetchBlob.fs.cp(refineFileUri, newPath);
};

export { getPathInDocuments, purgeTempFiles, copyToDocuments };
