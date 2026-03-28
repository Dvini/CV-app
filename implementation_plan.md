# CV Builder Improvements and Bug Fixes

This implementation plan outlines the fixes for the issues discovered during the exploratory testing.

## User Review Required

> [!IMPORTANT]
> Please review the sidebar accordion behavior. Implementing an accordion means only one settings panel (e.g., "Dane Osobowe" or "Edukacja") will be open at a given time. If a user clicks a new panel, the previously open one will close. This prevents the sidebar from becoming infinitely long. Let me know if you approve this UX change!

## Proposed Changes

---

### [Preview & Pagination Fixes]

**Bug Description:** The live preview miscalculates the required number of pages when the content's `scrollHeight` barely exceeds the exact pixel height of the A4 layout (sometimes by just 1 or 2 pixels due to sub-pixel rendering or border rounding). This results in `pageCount = 2`, rendering a second page that is mostly empty or improperly translating content.

**Implementation:**
*   Add a tolerance buffer (epsilon of ~5px) to the `pageCount` calculation formula to prevent false positives when content perfectly aligns with the bottom boundary.
*   Update the calculation from `Math.ceil(totalHeight / visualContentHeight)` to `Math.ceil((totalHeight - 5) / visualContentHeight)`.
*   Additionally, ensure the `.cv-measure-container` doesn't artificially stretch the page blocks by applying a `min-height` fix if necessary.

#### [MODIFY] [CVPreview.jsx](file:///c:/Users/Wojtek/Desktop/gemini/app_cv/src/components/Preview/CVPreview.jsx)
- Update the measurement logic in the `useEffect` block.
- Adjust `pages` calculation to tolerate small fractional overflows.

---

### [Sidebar Accordion UX]

**Bug Description:** Opening multiple panels causes the sidebar to grow significantly, requiring excessive vertical scrolling to navigate between CV sections.

**Implementation:**
*   Modify the `Panel` component to behave as a controlled component (accepting `isOpen` and `onToggle` props) while maintaining backward compatibility with `defaultOpen`.
*   Update `EditorSidebar` to hold a state for the currently active panel. 
*   Wrap all panels in the sidebar to act as an Accordion interface (only one panel open at a time).

#### [MODIFY] [Panel.jsx](file:///c:/Users/Wojtek/Desktop/gemini/app_cv/src/components/Editor/shared/Panel.jsx)
- Add `isOpen` and `onToggle` to props.
- Add fallback to internal state if controlled props are not rigorously provided.

#### [MODIFY] [EditorSidebar.jsx](file:///c:/Users/Wojtek/Desktop/gemini/app_cv/src/components/Editor/EditorSidebar.jsx)
- Import `useState`.
- Create `openPanel` state initialized to `'personal'`.
- Pass `.isOpen = {openPanel === 'X'}` and `.onToggle = {() => setOpenPanel('X')}` to each Panel component wrapper.

## Open Questions

- Should any panel be open by default when the app runs first, or should they all start closed? (My plan currently defaults to "Dane Osobowe" being open).

## Verification Plan

### Manual Verification
- Render a single-page CV without triggering the "2 of 2" page badge automatically.
- Open various panels in the sidebar and verify that only one stays open at a time, removing the massive scrollbar.
