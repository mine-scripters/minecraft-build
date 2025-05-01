import fs from 'fs';

interface RenameTaskParameters {
  // Source file to rename
  source: string;
  // Target file to rename
  target: string;
}

/**Rename task */
export const renameTask = (params: RenameTaskParameters) => {
  return () => {
    if (!fs.existsSync(params.source)) {
      throw new Error(`Source file ${params.source} does not exist.`);
    }

    if (fs.existsSync(params.target)) {
      throw new Error(`Target file ${params.target} already exist.`);
    }

    fs.renameSync(params.source, params.target);
  };
};
