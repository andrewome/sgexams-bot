/* eslint-disable no-console, @typescript-eslint/no-explicit-any, arrow-body-style, no-empty */
import * as fs from 'fs';
import { Storage } from '../main/storage/Storage';

export const TEST_STORAGE_PATH = './TESTING.db';

export const deleteDbFile = (): void => {
    try {
        fs.unlinkSync(TEST_STORAGE_PATH);
    } catch (err) {}
};

export const compareArrays = (arr1: any[], arr2: any[]): boolean => {
    return arr1.toString() === arr2.toString();
};

export const isEmptyArray = (arr: any[]): boolean => {
    return arr.length === 0;
};

/**
 * This method reserialises the db file. Then checks with the input storage object
 * Returns true if they are identical, false if not.
 *
 * Use this to check if the db file was updated properly after a method is supposed to update it.
 *
 * @param  {Storage} storage
 * @returns boolean
 */
export const compareWithReserialisedStorage = (storage: Storage): boolean => {
    return new Storage().loadServers().equals(storage);
};
