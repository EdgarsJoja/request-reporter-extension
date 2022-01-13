<script lang="ts">
    export let report: string;
</script>

<main class="content">
    <pre>{report}</pre>
</main>

<style>
    .content {
        padding: 1em;
    }

    pre {
        word-break: break-word;
        white-space: pre-wrap;
    }
</style>
