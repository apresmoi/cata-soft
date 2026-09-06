import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Providers } from "../Providers";
import { HomeScreen, PatientScreen } from "../pages";
import { SCREENS, type ScreenId } from "./variants";

/**
 * Renders one real screen under one variant. Loaded in its own iframe by the
 * gallery, so each preview gets a clean viewport -- the screens are sized with
 * h-screen/w-screen and would fight each other on a shared page.
 */
export function Preview(props: { screen: ScreenId }) {
  const screen = SCREENS.find((entry) => entry.id === props.screen) ?? SCREENS[0];

  return (
    <Providers>
      <MemoryRouter initialEntries={[screen.path]}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/patient/:id" element={<PatientScreen />} />
        </Routes>
      </MemoryRouter>
    </Providers>
  );
}
