import { useState } from "react";

type NavbarProps = {
  onHomeClick: () => void;
  onThemeChange: () => void;
  onThemeSelect: (index: number) => void;
  themeIndex: number;
  themes?: string[];
  scrollFormat: "horizontal" | "vertical";
  onScrollFormatChange: (
    format: "horizontal" | "vertical",
  ) => void;
  onResetExperience: () => void;
  onMemesClick: () => void;
  maxAllowedPage: number;
};

const DEFAULT_THEMES = [
  "Green",
  "Blue",
  "High Contrast",
  "Purple",
  "Sunset",
  "Pink",
  "Cyan",
  "Mono",
];

export default function Navbar({
  onHomeClick,
  onThemeChange: _onThemeChange,
  onThemeSelect,
  themeIndex,
  themes = DEFAULT_THEMES,
  scrollFormat,
  onScrollFormatChange,
  onResetExperience,
  onMemesClick,
  maxAllowedPage,
}: NavbarProps) {
  const memesLocked = maxAllowedPage === -2;

  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] =
    useState(false);
  const [themeOpen, setThemeOpen] =
    useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const closeNavigationPanels = () => {
    setMenuOpen(false);
    setSettingsOpen(false);
    setThemeOpen(false);
  };

  const handleHomeClick = () => {
    closeNavigationPanels();
    onHomeClick();
  };

  const handleMemesClick = () => {
    closeMenu();

    if (memesLocked) {
      return;
    }

    onMemesClick();
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    setThemeOpen(false);
  };

  const toggleSettings = () => {
    setSettingsOpen((open) => !open);
    setThemeOpen(false);
  };

  const selectTheme = (index: number) => {
    onThemeSelect(index);
    setThemeOpen(false);
  };

  const selectScrollFormat = (
    format: "horizontal" | "vertical",
  ) => {
    onScrollFormatChange(format);
  };

  const handleReset = () => {
    closeSettings();
    onResetExperience();
  };

  return (
    <header className="navbar">
      <a
        className="logo"
        aria-label="OSDC — Home"
        href="https://osdc.dev"
      >
        <img
          src="https://links.osdc.dev/assets/logo-pixel.svg"
          alt="OSDC"
        />
      </a>

      <nav
        id="mobile-navigation"
        className={`navitems ${
          menuOpen ? "navitems-open" : ""
        }`}
      >
        <button
          type="button"
          className="nav-link-button"
          onClick={handleHomeClick}
          aria-label="Go to home"
        >
          Home
        </button>

        <a
          href="https://links.osdc.dev"
          onClick={closeMenu}
        >
          Socials
        </a>

        <button
          type="button"
          className={`nav-link-button${
            memesLocked
              ? " nav-link-locked"
              : ""
          }`}
          onClick={handleMemesClick}
          aria-label={
            memesLocked
              ? "Memes are locked"
              : "Go to memes"
          }
          aria-disabled={memesLocked}
        >
          Memes

          {memesLocked && (
            <span
              className="nav-lock"
              aria-hidden="true"
            >
              🔒
            </span>
          )}
        </button>

        <a
          href="https://github.com/kuwushagra/git-gud-osdc"
          onClick={closeMenu}
        >
          Repo
        </a>
      </nav>

      <div
        className="navbar-actions"
        style={{ position: "relative" }}
      >
        <button
          type="button"
          className="theme-button settings-button"
          onClick={toggleSettings}
          aria-label={
            settingsOpen
              ? "Close settings"
              : "Open settings"
          }
          aria-expanded={settingsOpen}
        >
          <span>SETTINGS</span>

          <span
            className="settings-menu-icon"
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
          </span>
        </button>

        <button
          type="button"
          className={`menu-button ${
            menuOpen ? "menu-button-open" : ""
          }`}
          onClick={() =>
            setMenuOpen((open) => !open)
          }
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          <span className="menu-label">
            MENU
          </span>

          <span
            className="menu-icon"
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
          </span>
        </button>

        {settingsOpen && (
          <div
            className="settings-panel"
            role="menu"
            style={{
              position: "absolute",
              top: "calc(100% + 12px)",
              right: 0,
              zIndex: 100,
              minWidth: "230px",
              padding: "12px",
              background:
                "var(--background, #fff)",
              color: "currentColor",
              border: "2px solid currentColor",
              boxShadow:
                "6px 6px 0 currentColor",
            }}
          >
            {!themeOpen ? (
              <>
                <button
                  type="button"
                  className="settings-entry"
                  onClick={() =>
                    setThemeOpen(true)
                  }
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>Theme</span>
                  <span>→</span>
                </button>

                <div
                  style={{
                    height: "1px",
                    background:
                      "currentColor",
                    margin: "8px 0",
                    opacity: 0.35,
                  }}
                />

                <div className="settings-entry-group">
                  <div className="settings-entry-label">
                    Scroll format
                  </div>

                  <button
                    type="button"
                    className={`settings-option${
                      scrollFormat ===
                      "horizontal"
                        ? " is-selected"
                        : ""
                    }`}
                    onClick={() =>
                      selectScrollFormat(
                        "horizontal",
                      )
                    }
                  >
                    Horizontal

                    {scrollFormat ===
                      "horizontal" && (
                      <span>✓</span>
                    )}
                  </button>

                  <button
                    type="button"
                    className={`settings-option${
                      scrollFormat === "vertical"
                        ? " is-selected"
                        : ""
                    }`}
                    onClick={() =>
                      selectScrollFormat(
                        "vertical",
                      )
                    }
                  >
                    Vertical

                    {scrollFormat ===
                      "vertical" && (
                      <span>✓</span>
                    )}
                  </button>
                </div>

                <div
                  style={{
                    height: "1px",
                    background:
                      "currentColor",
                    margin: "8px 0",
                    opacity: 0.35,
                  }}
                />

                <button
                  type="button"
                  className="settings-entry settings-reset"
                  onClick={handleReset}
                  style={{
                    width: "100%",
                  }}
                >
                  Reset experience
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="settings-entry"
                  onClick={() =>
                    setThemeOpen(false)
                  }
                  style={{
                    width: "100%",
                    justifyContent:
                      "flex-start",
                  }}
                >
                  ← Theme
                </button>

                <div
                  style={{
                    height: "1px",
                    background:
                      "currentColor",
                    margin: "8px 0",
                    opacity: 0.35,
                  }}
                />

                {themes.map(
                  (theme, index) => (
                    <button
                      type="button"
                      key={theme}
                      className={`settings-option${
                        themeIndex === index
                          ? " is-selected"
                          : ""
                      }`}
                      onClick={() =>
                        selectTheme(index)
                      }
                      style={{
                        width: "100%",
                      }}
                    >
                      <span>{theme}</span>

                      {themeIndex === index && (
                        <span>✓</span>
                      )}
                    </button>
                  ),
                )}
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}