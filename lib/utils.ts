import { ReadonlyURLSearchParams } from 'next/navigation';
import type { Collection } from './squarespace/types';

export const createUrl = (pathname: string, params: URLSearchParams | ReadonlyURLSearchParams) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? '?' : ''}${paramsString}`;

  return `${pathname}${queryString}`;
};

export const fuzzyMatch = (haystack: string, needle: string) =>
  haystack.toLowerCase().includes(needle.toLowerCase());

export const replaceNonAlphanumeric = (str: string, replacement: string = '-'): string =>
  str = str.replace(/\W+/g, replacement).toLowerCase();

export const convertTagToCollection = (tag: string): Collection => ({
  path: `/search/${replaceNonAlphanumeric(tag)}`,
  handle: tag.toLowerCase(),
  title: tag,
  description: '',
  seo: {
    title: tag,
    description: ''
  },
  updatedAt: new Date().toISOString()
});

export const ensureStartsWith = (stringToCheck: string, startsWith: string) =>
  stringToCheck.startsWith(startsWith) ? stringToCheck : `${startsWith}${stringToCheck}`;

export const validateEnvironmentVariables = () => {
  const requiredEnvironmentVariables = ['SQUARESPACE_API_KEY'];
  const missingEnvironmentVariables = [] as string[];

  requiredEnvironmentVariables.forEach((envVar) => {
    if (!process.env[envVar]) {
      missingEnvironmentVariables.push(envVar);
    }
  });

  if (missingEnvironmentVariables.length) {
    throw new Error(
      `The following environment variables are missing. Your site will not work without them.`
    );
  }
};