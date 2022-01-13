export interface ParsedRequest {
    url: string,
    queryString: string[],
    method: string,
    postParams: {[key: string]: any},
    dateTime: Date,
    status: number,
    statusText: string,
    response: string
}
