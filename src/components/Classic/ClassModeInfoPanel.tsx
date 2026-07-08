import InfoPanel, {
  InfoCard,
  InfoGrid,
  InfoRow,
  InfoSection,
} from "@components/ui/InfoPanel/InfoPanel";
const ClassicModeInfoPanel = () => {
  return (
    <InfoPanel title="How Classic Mode works">
      <InfoSection>
        <InfoRow icon="">
          Keep your physical Jenga tower on the table. this app handles the
          prompts. Pull a block, tap to reveal, do the challenge, then stack it
          on top.
        </InfoRow>
        <InfoRow icon="">
          Switch lists anytime from the <strong>Lists</strong> tab. Whatever
          list is active when you start a game is the one that gets used.
        </InfoRow>
      </InfoSection>
      <InfoSection heading="Block types">
        <InfoGrid>
          <InfoCard
            icon="🎲"
            label="Blank Blocks"
            text="Choose this if your blocks have nothing written on them. Pull any block and tap Reveal — the app picks a random prompt for you."
          />
          <InfoCard
            icon="🔢"
            label="Numbered Blocks"
            text="Choose this if your physical blocks are numbered 1–54. When you pull one, type that number into the app to reveal the prompt assigned to it."
          />
        </InfoGrid>
      </InfoSection>
      <InfoSection heading="Numbered block order">
        <InfoRow icon="">
          Random — the prompts are shuffled so nobody knows what any block holds
          until it's pulled.
        </InfoRow>
        <InfoRow icon="">
          List order — block 1 always shows the first prompt in your list, block
          2 the second, and so on. You can only change this before the first one
          is pulled.
        </InfoRow>
      </InfoSection>
      <InfoSection heading="Spicy mode">
        <InfoRow icon="">
          Turn on the 🔥 toggle to enable spicy prompts. Each time a prompt with
          a spicier version comes up, you'll get to choose which one you want.
          Prompts without a spicy version just show as normal.
        </InfoRow>
      </InfoSection>
      <InfoSection heading="Controls">
        <InfoRow icon="">
          Dismissed the prompt too fast? <strong>View Last Prompt</strong>{" "}
          brings it back, including which version was shown.
        </InfoRow>
        <InfoRow icon="">
          <strong>Switch Block Type</strong> lets you swap between blank and
          numbered mid-game. Your current progress will be lost when you switch.
        </InfoRow>
        <InfoRow icon="">
          <strong>Reset</strong> starts the game over with a fresh shuffle. Your
          lists are never affected.
        </InfoRow>
      </InfoSection>
    </InfoPanel>
  );
};
export default ClassicModeInfoPanel;
