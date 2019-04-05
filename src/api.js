import { URL_API } from './definition';

const FILES_DIR = 'Designs';

import RNFetchBlob, { FetchBlobResponse } from 'rn-fetch-blob';

const fetchCategories = async () => {
  const response = await RNFetchBlob.fetch('GET', `${URL_API}/api/categories`);

  if (response.info().status >= 400) {
    throw new Error(`Server status: ${response.info().status}`);
  }

  return response.json();
};

const fetchDesigns = async category => {
  const response = await RNFetchBlob.fetch(
    'GET',
    encodeURI(`${URL_API}/api/categories/${category}/names`)
  );

  if (response.info().status >= 400) {
    throw new Error(`Server status: ${response.info().status}`);
  }

  return response.json();
};

const fetchDesignFiles = async (category, design) => {
  const response = await RNFetchBlob.fetch(
    'GET',
    encodeURI(`${URL_API}/api/categories/${category}/names/${design}/files`)
  );

  if (response.info().status >= 400) {
    throw new Error(`Server status: ${response.info().status}`);
  }

  return response.json();
};

const fetchDesignManifest = async (category, design) => {
  const response = await RNFetchBlob.fetch(
    'GET',
    encodeURI(`${URL_API}/api/categories/${category}/names/${design}/manifest`)
  );

  if (response.info().status >= 400) {
    throw new Error(`Server status: ${response.info().status}`);
  }

  return response.json();
};

const downloadFile = async (remote, local) => {
  const dirs = RNFetchBlob.fs.dirs;
  const fileName = remote.split('/')[4];
  const relatePath = encodeURI(`/${FILES_DIR}/${local}/${fileName}`);
  const localPath = dirs.DocumentDir + relatePath;

  await RNFetchBlob.config({ path: localPath }).fetch(
    'GET',
    encodeURI(`${URL_API}/${remote}`),
    {}
  );

  return relatePath;
};

const apiRoute = remote => {
  return encodeURI(`${URL_API}/${remote}`);
};

export default {
  apiRoute,
  downloadFile,
  fetchCategories,
  fetchDesigns,
  fetchDesignFiles,
  fetchDesignManifest
};
