<script lang="ts">
    import { onMount } from 'svelte';
    import type { ParsedRequest } from './parsed-request';
    import Request from './components/Request.svelte';
    import reportTemplate from './report-template';
    import Report from './components/Report.svelte';

    let requests: ParsedRequest[] = [];

    let report: string = '';
    let showReport = false;

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
</script>

<main class="content">
    <div class="actions">
        {#if !showReport}
            <button type="button" on:click={clearRequests}><strong>Clear</strong></button>
        {/if}
        {#if showReport}
            <button type="button" on:click={() => showReport = false}>Back to Requests</button>
        {/if}
    </div>
    {#if !showReport}
        <div class="requests">
            {#each requests as req}
                <div class="request" on:click={() => handleReport(req)}>
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

    .requests, .report {
        padding-top: 4em;
    }

    .requests .request {
        padding-left: .5em;
        padding-right: .5em;
        margin-bottom: 1em;
        display: flex;
        justify-content: space-between;
    }

    .request:hover {
        color: #7952B3;
        cursor: pointer;
    }

    button {
        border: 1px solid #343A40;
        background: transparent;
        border-radius: 5px;
        padding: .5em 1em;
    }

    button:hover {
        cursor: pointer;
    }
</style>
