<script lang="ts">
    export let tags: string[];
    export let initialSelectedTag: string | undefined;
    export let handleSubmit: (tag: string) => void;
    const handleFormSubmit = (): void => {
        handleSubmit(selectedTag);
    };
    let selectedTag: string;

    if (initialSelectedTag) {
        selectedTag = initialSelectedTag;
    }
</script>

<h3>Select Tag</h3>

<form on:submit|preventDefault={handleFormSubmit}>
    <select class="dropdown" bind:value={selectedTag}>
        {#each tags as tag}
            <option value={tag}>{tag}</option>
        {/each}
    </select>
    <button class="mod-cta" type="submit">Submit</button>
</form>
