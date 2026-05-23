import { useState } from "react";
import Header from "./components/Header/Header";
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
import { getListById, getListNameById } from "./utils/listHelpers";

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
          activeList={{
            id: classicListId,
            name: getListNameById(classicListId, customLists),
            items: getListById(classicListId, customLists),
          }}
        />
        {showLists && (
          <ListManager
            customLists={customLists}
            setCustomLists={setCustomLists}
            classicListId={classicListId}
            boardListId={boardListId}
            onSetActive={handleSetActive}
            onClose={() => setShowLists(false)}
          />
        )}
      </section>
    </>
  );
}

export default App;
