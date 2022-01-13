import type { ParsedRequest } from '../parsed-request';

const filterByUrl = (request: ParsedRequest, filterValue: string): boolean => {
    return  request.url.includes(filterValue);
};

export {
    filterByUrl
}
