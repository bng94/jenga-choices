import { useState } from "react";
import Header from "./components/Header/Header";
import ThemePicker from "./components/ThemePicker/ThemePicker";
import ListManager from "./components/Lists/ListManager";
import type { AppView, CustomList, GameMode } from "./types";
import "./App.css";
import ClassicMode from "./components/Classic/ClassicMode";
import {
  loadBoardListId,
  loadClassicListId,
  loadCustomLists,
  saveBoardListId,
  saveClassicListId,
} from "./utils/storage";
import { getFullListById } from "./utils/listHelpers";

function App() {
  const [view, setView] = useState<AppView>("classic");
  const [customLists, setCustomLists] = useState<CustomList[]>(() =>
    loadCustomLists(),
  );
  const [classicListId, setClassicListId] = useState<string>(() =>
    loadClassicListId(),
  );
  const [boardListId, setBoardListId] = useState<string>(() =>
    loadBoardListId(),
  );
  const [showLists, setShowLists] = useState(false);
  const [classicInProgress, setClassicInProgress] = useState(false);

  const handleSetActive = (id: string, forMode: GameMode) => {
    if (forMode === "classic") {
      setClassicListId(id);
      saveClassicListId(id);
    } else {
      setBoardListId(id);
      saveBoardListId(id);
    }
  };
  return (
    <>
      <section id="app">
        <Header
          view={view}
          onViewChange={(v) => {
            setView(v);
          }}
          onShowLists={() => setShowLists(true)}
        />
        <ClassicMode
          activeList={getFullListById(classicListId, customLists)}
          onProgressChange={setClassicInProgress}
        />
        {showLists && (
          <ListManager
            customLists={customLists}
            setCustomLists={setCustomLists}
            classicListId={classicListId}
            boardListId={boardListId}
            onSetActive={handleSetActive}
            onClose={() => setShowLists(false)}
            classicInProgress={classicInProgress}
          />
        )}
        <ThemePicker />
      </section>
    </>
  );
}

export default App;
