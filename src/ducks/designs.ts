import api from '../api';
import { getCategories } from './categories';
import RNFetchBlob from 'rn-fetch-blob';
import { getPathInDocuments } from '../fs';
import { Design, DesignStatus } from './../definition';

export const GET_DESIGNS: string = 'starified/designs/get';
export const THUMBNAIL_READY: string = 'starified/designs/thumbnail';
export const FILE_DOWNLOADED: string = 'starified/designs/file';
export const REMOVE_DESIGN: string = 'starified/designs/remove';

type State = Design[];

const reducer = (state: State = [], action: any): State => {
  switch (action.type) {
    case GET_DESIGNS:
      return reduceDesigns(state, action.payload);
    case THUMBNAIL_READY:
      // update design status to 'thumb'
      return state.map(design => {
        if (design.id !== action.payload.id) {
          return design;
        }

        return {
          ...design,
          status: DesignStatus.THUMB,
          thumb: {
            ready: true,
            remote: design.thumb.remote,
            localPath: action.payload.path
          }
        };
      });
    case FILE_DOWNLOADED:
      // update download status for file and check if all files downloaded
      // if yes - set status for design as 'ready'
      return state.map(design => {
        if (design.id !== action.payload.id) {
          return design;
        }

        const updated = {
          ...design,
          files: design.files.map(file => {
            if (file.file !== action.payload.file) {
              return file;
            } else {
              return {
                ...file,
                ready: true,
                localPath: action.payload.path
              };
            }
          })
        };

        let allReady = true;

        updated.files.forEach(f => {
          allReady = allReady && f.ready;
        });

        if (allReady && design.status !== 'ready') {
          updated.status = DesignStatus.READY;
        }

        return updated;
      });
    case REMOVE_DESIGN:
      return state.filter(d => d.id !== action.payload.id);
    default:
      return state;
  }
};

/*
  How it works:
  send server request to download categories - emit get_categories action
  for each category download designs file data and manifest
  Files returned as stupid array, but we need to act completly differntly
  for diefferent files. So we analyze file name and build our domain logic objects
  to redux store.
 */
export const getDesigns = (): any => {
  return async (dispatch: ({}) => void) => {
    const categories = await api.fetchCategories();
    dispatch(getCategories(categories));

    const allDesigns = [];

    for (let i = 0; i < categories.length; i++) {
      const c = categories[i];

      const designs = await api.fetchDesigns(c);

      for (let j = 0; j < designs.length; j++) {
        const d = designs[j];

        const manifest = await api.fetchDesignManifest(c, d);
        const fileList = await api.fetchDesignFiles(c, d);

        const designItem = {
          id: guid(),
          title: d,
          manifest,
          category: c,
          status: DesignStatus.PENDING
        };

        parseFileData(designItem, fileList);

        allDesigns.push(designItem);
      }
    }

    dispatch({
      type: GET_DESIGNS,
      payload: allDesigns
    });

    dispatch(downloadFiles());
  };
};

export const validateLocalData = (): any => {
  return async (dispatch, getState) => {
    const designs = getState().designs;

    if (!designs) {
      return;
    }

    for (let i = 0; i < designs.length; i++) {
      const design = designs[i];

      let valid = true;

      valid =
        valid &&
        (await RNFetchBlob.fs.exists(
          getPathInDocuments(design.thumb.localPath)
        ));

      for (let j = 0; j < design.files.length; j++) {
        const file = design.files[j];

        valid =
          valid &&
          (await RNFetchBlob.fs.exists(getPathInDocuments(file.localPath)));
      }

      if (!valid) {
        dispatch(removeDesign(design));
      }
    }
  };
};

export const thumbnailReady = (designId, localPath) => {
  return {
    type: THUMBNAIL_READY,
    payload: {
      id: designId,
      path: localPath
    }
  };
};

export const fileReady = (designId, remoteUrl, localPath) => {
  return {
    type: FILE_DOWNLOADED,
    payload: {
      id: designId,
      file: filename(remoteUrl),
      path: localPath
    }
  };
};

export const removeDesign = design => {
  return {
    type: REMOVE_DESIGN,
    payload: {
      ...design
    }
  };
};

export const downloadFiles = () => {
  return async (dispatch, getState) => {
    await dispatch(preloadThumbnails());

    const designs = getState().designs;

    for (let i = 0; i < designs.length; i++) {
      const design = designs[i];

      if (design.status === 'ready') {
        return;
      }

      if (design.config && design.config.ready === false) {
        await downloadAndParseConfig(design);
      }

      design.files.forEach(async file => {
        if (!file.downloaded) {
          const localPath = await api.downloadFile(file.remote, design.id);
          dispatch(fileReady(design.id, file.remote, localPath));
        }
      });
    }
  };
};

export const preloadThumbnails = () => {
  return async (dispatch, getState) => {
    const designs = getState().designs;

    for (var i = 0; i < designs.length; i++) {
      const design = designs[i];

      if (design.status === 'ready') {
        continue;
      }
      if (!design.thumb.ready) {
        const localPath = await api.downloadFile(
          design.thumb.remote,
          design.id
        );

        dispatch(thumbnailReady(design.id, localPath));
      }
    }
  };
};

// Utils functions

const guid = (): string => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return (
    s4() +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    s4() +
    s4()
  );
};
// we have names like '/upload/foo/bar/data1.json'
const filename = (remote: string): string => remote.split('/')[4];

// Working with data
const parseFileData = (designItem: Design, files: string[]): void => {
  // actual data is unstrcutered in we het it inside json arrays.
  // We need to do different things with different files
  // So let's split one from anothers

  // extract thumbnails
  let thumb = files.find(f => filename(f).startsWith('thumb'));
  designItem.thumb = {
    ready: false,
    remote: thumb,
    localPath: null
  };

  // in case where is no config file, "config" field will be undefined
  let config = files.find(f => filename(f).startsWith('config.json'));
  if (config) {
    designItem.config = {
      ready: false,
      remote: config
    };
  }

  // extract previews.
  // We don't have to download them. They are used in case if user perform long
  // tap on design item
  designItem.previews = files.filter(f => filename(f).startsWith('preview'));

  // include only lottie design item
  designItem.files = files
    .filter(file => {
      return filename(file).startsWith('data');
    })
    .map(file => ({
      ready: false,
      remote: file,
      file: filename(file),
      localPath: null
    }));
};

const downloadAndParseConfig = async (design: Design) => {
  const configJson = await api.downloadFile(design.config.remote, design.id);
  const rawData = await RNFetchBlob.fs.readFile(getPathInDocuments(configJson));
  design.config = {
    ...JSON.parse(rawData),
    ready: true,
    remote: design.config.remote
  };
};

const reduceDesigns = (oldDesigns: Design[], newDesigns: Design[]) => {
  const result = [];
  let item;

  newDesigns.forEach(design => {
    // do we have it already downloaded?
    const old = oldDesigns.find(
      d => d.title === design.title && d.category === design.category
    );

    if (old) {
      // check manifest
      if (old.manifest === design.manifest) {
        // old is fine, no need to update
        item = old;
      } else {
        item = design;
      }
    } else {
      item = design;
    }

    result.push({ ...item, files: [...item.files] });
  });

  return result;
};

export default reducer;
