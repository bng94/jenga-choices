import InfoPanel, {
  InfoSection,
  InfoGrid,
  InfoCard,
  InfoRow,
} from "@components/ui/InfoPanel/InfoPanel";

const ListEditorInfoPanel = () => {
  return (
    <InfoPanel title="List Editor">
      <InfoSection>
        <InfoRow icon="" centered>
          Each list holds up to 54 items, one prompt item per Jenga block.
        </InfoRow>
        <InfoRow icon="" centered>
          Empty slots show as blanks during gameplay, which groups can use as
          wild cards or house rules.
        </InfoRow>
      </InfoSection>

      <InfoSection heading="Item types">
        <InfoGrid>
          <InfoCard
            icon="💬"
            label="Single"
            text="One prompt shown directly when the block is pulled."
          />
          <InfoCard
            icon="🤔"
            label="Truth / Dare"
            text="Player picks Truth or Dare first, then sees that prompt."
          />
        </InfoGrid>
      </InfoSection>

      <InfoSection heading="Spicy">
        <InfoRow icon="">
          Toggle <strong>🔥 Spicy</strong> in the header to show spicy input
          fields. Spicy is optional, add it to any item to offer a spicier
          version when Spicy mode is on during gameplay.
        </InfoRow>
      </InfoSection>

      <InfoSection heading="Drag &amp; reorder">
        <InfoRow icon="" centered>
          Use <strong>☰</strong> to drag and reorder entire rows.
        </InfoRow>
        <InfoRow icon="">
          Use <strong>⠿T</strong> or <strong>⠿D</strong> to drag a truth or dare
          half to a different row — spicy text travels with it.
        </InfoRow>
        <InfoRow icon="">
          Use <strong>🔥⠿</strong> to drag spicy text to any slot, or drop it on
          a main prompt to swap them.
        </InfoRow>
      </InfoSection>

      <InfoSection heading="Bulk add">
        <InfoRow icon="">
          Use <strong>Paste</strong> to add multiple prompts at once. Type one
          per line, or paste a JSON file you exported from Jenga Choices.
        </InfoRow>
      </InfoSection>

      <InfoSection heading="Saving">
        <InfoRow icon="">
          If a Truth/Dare row only has one half filled when you save, the app
          will ask what you want to do: fix it, convert it to a single, or save
          as is.
        </InfoRow>
      </InfoSection>
    </InfoPanel>
  );
};

export default ListEditorInfoPanel;
