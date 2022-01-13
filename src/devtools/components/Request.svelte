<script lang="ts">
    import type { ParsedRequest } from '../parsed-request';

    export let request: ParsedRequest;
</script>

<div class="request">
    <div class="url request-param">
        <strong>{request.url}</strong>
    </div>
    <div class="method request-param">{request.method}</div>
    <div class="status request-param">
        {request.status}
        {#if request.statusText}
            ({request.statusText})
        {/if}
    </div>
</div>

<style>
    .request {
        padding-top: .5em;
        padding-bottom: .5em;
        display: grid;
        grid-template-columns: 4fr 1fr 1fr;
        width: 100%;
    }

    .request-param {
        padding: 0 .5em;
        border: none;
        word-break: break-word;
    }
</style>
