<script lang="ts">
    import { onMount } from 'svelte';
    import type { ParsedRequest } from './parsed-request';
    import Request from './components/Request.svelte';
    import reportTemplate from './report-template';
    import Report from './components/Report.svelte';
    import { filterByUrl } from './services/filters';

    let requests: ParsedRequest[] = [];
    let displayRequests: ParsedRequest[] = [];

    $: displayRequests = requests.filter((request) => filterByUrl(request, filterTextValue));

    let report: string = '';
    let showReport = false;
    let filterTextValue = '';

    onMount(() => {
        chrome.devtools.panels.create('Request Reporter', null, './devtools.html', (panel) => {
        });

        chrome.devtools.network.getHAR((result: any) => result.entries.map(addParsedRequest));
        // @todo: Remove listener to avoid memory leaks.
        chrome.devtools.network.onRequestFinished.addListener((result: any) => addParsedRequest(result));
    });

    /**
     * Parses network request data and updates internal requests array.
     *
     * @param rawRequest
     */
    const addParsedRequest = (rawRequest: any): void => {
        const req = rawRequest.request;
        const resp = rawRequest.response;

        if (!['fetch', 'xhr'].includes(rawRequest._resourceType)) {
            return;
        }

        rawRequest.getContent((responseContent) => {
            requests.push({
                url: req.url,
                queryString: req.queryString,
                method: req.method,
                postParams: req.postData?.params ?? [],
                dateTime: new Date(rawRequest.startedDateTime),
                status: resp.status,
                statusText: resp.statusText,
                response: responseContent
            });
            requests = requests;
        });
    }

    /**
     * Clears current requests.
     */
    const clearRequests = (): void => {
        requests = [];
    }

    /**
     * Generates request report string.
     *
     * @param request
     */
    const generateRequestReport = (request: ParsedRequest): string => {
        return reportTemplate
            .replace('{dateTime}', request.dateTime.toLocaleString())
            .replace('{url}', request.url)
            .replace('{method}', request.method)
            .replace('{status}', request.status.toString())
            .replace('{statusText}', request.statusText)
            .replace('{postData}', JSON.stringify(request.postParams, undefined, 2))
            .replace('{response}', JSON.stringify(JSON.parse(request.response), undefined, 2));
    }

    /**
     * Handles report generation & display logic.
     *
     * @param request
     */
    const handleReport = (request: ParsedRequest): void => {
        report = generateRequestReport(request);
        showReport = true;
    }

    /**
     * Returns whether the particular request should be highlighted.
     *
     * @param request
     */
    const highlightRequest = (request: ParsedRequest): boolean => {
        return request.status >= 400;
    }
</script>

<main class="content">
    <div class="actions">
        {#if !showReport}
            <input type="text" class="action-filter" bind:value={filterTextValue} placeholder="Type to filter..." />
            <button type="button" class="action-clear" on:click={clearRequests}>Clear All</button>
        {/if}
        {#if showReport}
            <button type="button" on:click={() => showReport = false}>&lt;&lt; Back</button>
        {/if}
    </div>
    {#if !showReport}
        <div class="requests">
            {#each displayRequests as req}
                <div class="request" class:highlight="{highlightRequest(req)}" on:click={() => handleReport(req)}>
                    <Request request={req}/>
                </div>
            {/each}
        </div>
    {/if}
    {#if showReport}
        <div class="report">
            <Report report={report}/>
        </div>
    {/if}
</main>

<style>
    :root {
        --actions-toolbar-height: 60px
    }

    * {
        box-sizing: border-box;
    }

    .content {
        background: #E1E8EB;
        min-height: 100%;
        height: max-content;
        color: #343A40;
        padding-top: var(--actions-toolbar-height);
    }

    .actions {
        position: fixed;
        width: 100%;
        max-height: var(--actions-toolbar-height);
        height: var(--actions-toolbar-height);
        top: 0;
        background: #E1E8EB;
        padding: 1em;
        box-shadow: 0 5px 5px 0 #8794AF;
    }

    .action-filter {
        height: 2em;
        border-radius: 5px;
        float: left;
        position: relative;
        top: 50%;
        transform: translateY(-50%);
        padding: .5em
    }

    .action-clear {
        float: right;
    }

    .requests, .report {
        padding-top: 2em;
        padding-bottom: 2em;
    }

    .requests .request {
        padding-left: .5em;
        padding-right: .5em;
        margin-bottom: 1em;
        display: flex;
        justify-content: space-between;
    }

    .request:hover {
        color: #16C79A;
        cursor: pointer;
    }

    .request.highlight {
        color: #E94560;
    }

    button {
        background: #16213E;
        color: #E1E8EB;
        border-radius: 5px;
        padding: .5em 1em;
        font-weight: bold;
    }

    button:hover {
        cursor: pointer;
        color: #E94560;
    }
</style>
