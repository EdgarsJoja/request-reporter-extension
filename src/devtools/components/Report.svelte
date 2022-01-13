<script lang="ts">
    export let report: string;
</script>

<main class="content">
    <textarea>{report}</textarea>
</main>

<style>
    .content {
        padding: 1em;
    }

    textarea {
        word-break: break-word;
        white-space: pre-wrap;
        width: calc(100% - 1em);
        height: 80vh;
        padding: .5em;
        border: none;
        outline: none;
        border-radius: 5px;
    }
</style>
