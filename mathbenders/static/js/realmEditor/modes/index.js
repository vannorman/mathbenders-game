import DraggingObjectRealmBuilderMode from "./draggingObjectRealmBuilderMode.js";
import EditingItemRealmBuilderMode from "./editingItemRealmBuilderMode.js";
import LoadScreenRealmBuilderMode from "./loadScreenRealmBuilderMode.js";
import MapScreenRealmBuilderMode from "./mapScreenRealmBuilderMode.js";
import NormalRealmBuilderMode from "./normalRealmBuilderMode.js";
import OrbitRealmBuilderMode from "./orbitRealmBuilderMode.js";
import HandPanRealmBuilderMode from "./handPanRealmBuilderMode.js";
import SelectRealmBuilderMode from "./selectRealmBuilderMode.js";
import BuildWallsMode from "./buildWallsMode.js";

// Using a Map data structure to keep track of modes, and access them via their
// associate map key string. Because these modes 'act' on the RealmBuilder via
// mouse actions (e.g. click, scroll, up), we pass a reference to 'this' RealmEditor,
// so it may be used within the active mode (e.g. realm builder method invocations).
// Using this approach, it is clear to the developer at this line what modes there are,
// and the addition of new modes ought to be as simple has adding an entry into the map initializer.
// The developer adds an entry here, and does all their new mode development in a separate file


export {
    DraggingObjectRealmBuilderMode,
    EditingItemRealmBuilderMode,
    HandPanRealmBuilderMode,
    LoadScreenRealmBuilderMode,
    MapScreenRealmBuilderMode,
    NormalRealmBuilderMode,
    OrbitRealmBuilderMode,
    SelectRealmBuilderMode,
    BuildWallsMode
};
