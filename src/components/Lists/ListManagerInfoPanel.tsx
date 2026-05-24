import InfoPanel, {
  InfoSection,
  InfoGrid,
  InfoCard,
  InfoRow,
} from "../InfoPanel/InfoPanel";

const ListManagerInfoPanel = () => {
  return (
    <InfoPanel title="How lists work">
      <InfoSection>
        <InfoRow icon="">
          Each list holds up to 54 items. Empty slots show as blanks during
          gameplay, which groups can use as wild cards or house rules.
        </InfoRow>
        <InfoRow icon="" centered>
          Set the active list for Classic Mode using the <strong>Use </strong>
          button on any list card.
        </InfoRow>
        <InfoRow icon="">
          Default lists can't be edited. Use <strong>Copy &amp; Edit</strong> to
          make your own version.
        </InfoRow>
      </InfoSection>
      <InfoSection heading="Item types">
        <InfoGrid>
          <InfoCard
            icon="💬"
            label="Single choice"
            text="One prompt shown directly. Add a 🔥 Spicy version for an optional spicier variant when Spicy mode is on."
          />
          <InfoCard
            icon="🤔"
            label="Truth / Dare"
            text="Player picks Truth or Dare, then sees that prompt. Both the Truth and Dare can have their own 🔥 Spicy version."
          />
        </InfoGrid>
      </InfoSection>
      <InfoSection heading="Import &amp; Export">
        <InfoRow icon="">
          Open any list and tap <strong>Export</strong> to download it as a
          file. Use this to back it up or share it with someone else.
        </InfoRow>
        <InfoRow icon="" centered>
          Use <strong>Import</strong> to load a list from a file to either
          backup you a list you exported or one someone shared with you.
        </InfoRow>
      </InfoSection>
      <InfoSection heading="Viewing">
        <InfoRow icon="">
          Open a list to read through all its prompts. If the list has spicy
          versions a 🔥 toggle appears to preview them.
        </InfoRow>
      </InfoSection>
    </InfoPanel>
  );
};

export default ListManagerInfoPanel;
