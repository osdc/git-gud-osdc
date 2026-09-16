import "./App.css";
import {
  motion,
  type Variants,
} from "motion/react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import Navbar from "./components/Navbar";
import Ticker from "./components/Ticker";
import ContentPage from "./components/ContentPage";
import { pages } from "./pages";
import { API_BASE_URL } from "./config";
import gitgudheader from "./assets/images/gitgudheader.svg";
import octocat from "./assets/images/octocat.png";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const themes = [
  "theme-green",
  "theme-blue",
  "theme-high-contrast",
  "theme-purple",
  "theme-sunset",
  "theme-pink",
  "theme-cyan",
  "theme-mono",
];

const STORAGE_KEYS = {
  githubId: "gitgud-github-id",
  teamName: "gitgud-team-name",
  teamSize: "gitgud-team-size",
  teamMember: "gitgud-team-member",
  themeIndex: "gitgud-theme-index",
};

function readStorageString(key: string): string {
  try {
    return (
      window.localStorage.getItem(key)?.trim() ||
      ""
    );
  } catch {
    return "";
  }
}

function readStorageNumber(
  key: string,
): number | null {
  try {
    const value = Number.parseInt(
      window.localStorage.getItem(key) || "",
      10,
    );

    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

function readTeamSize(): number | null {
  const value = readStorageNumber(
    STORAGE_KEYS.teamSize,
  );

  if (
    value === 1 ||
    value === 2 ||
    value === 3
  ) {
    return value;
  }

  return null;
}

function readTeamMember(): number | null {
  const teamSize = readTeamSize();

  if (!teamSize) {
    return null;
  }

  if (teamSize === 1) {
    return 1;
  }

  const member = readStorageNumber(
    STORAGE_KEYS.teamMember,
  );

  if (
    member &&
    member >= 1 &&
    member <= teamSize
  ) {
    return member;
  }

  return null;
}

function readThemeIndex(): number {
  const value = readStorageNumber(
    STORAGE_KEYS.themeIndex,
  );

  if (
    value !== null &&
    value >= 0 &&
    value < themes.length
  ) {
    return value;
  }

  return 0;
}

function saveStorageValue(
  key: string,
  value: string,
) {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}

async function fetchProgress(): Promise<number> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/progress/get`,
      {
        cache: "no-store",
      },
    );

    if (response.ok) {
      const data = await response.json();

      if (
        data &&
        typeof data.progress === "number"
      ) {
        return data.progress;
      }

      if (typeof data === "number") {
        return data;
      }
    }

    return 0;
  } catch (error) {
    console.error(
      "fetchProgress failed (likely CORS or Network Error):",
      error,
    );

    return 0;
  }
}

function App() {
  const [currentPage, setCurrentPage] =
    useState(0);

  const [themeIndex, setThemeIndex] =
    useState(() => readThemeIndex());

  const [githubId, setGithubId] =
    useState(() =>
      readStorageString(
        STORAGE_KEYS.githubId,
      ),
    );

  const [teamName, setTeamName] =
    useState(() =>
      readStorageString(
        STORAGE_KEYS.teamName,
      ),
    );

  const [teamSize, setTeamSize] =
    useState<number | null>(() =>
      readTeamSize(),
    );

  const [teamMemberNumber, setTeamMemberNumber] =
    useState<number | null>(() =>
      readTeamMember(),
    );

  const [maxAllowedPage, setMaxAllowedPage] =
    useState(1);

  const [showLockMessage, setShowLockMessage] =
    useState(false);

  const lockMessageTimer =
    useRef<number | null>(null);

  useEffect(() => {
    if (currentPage > maxAllowedPage + 1) {
      setCurrentPage(maxAllowedPage);
    }
  }, [maxAllowedPage, currentPage]);

  useEffect(() => {
    saveStorageValue(
      STORAGE_KEYS.themeIndex,
      String(themeIndex),
    );
  }, [themeIndex]);

  useEffect(() => {
    let cancelled = false;

    const checkStatus = async () => {
      const progress = await fetchProgress();

      if (cancelled) {
        return;
      }

      setMaxAllowedPage(progress);
    };

    checkStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (
        lockMessageTimer.current !== null
      ) {
        window.clearTimeout(
          lockMessageTimer.current,
        );
      }
    };
  }, []);

  const changeTheme = () => {
    setThemeIndex(
      (current) =>
        (current + 1) % themes.length,
    );
  };

  const showLockedMessage = () => {
    setShowLockMessage(true);

    if (
      lockMessageTimer.current !== null
    ) {
      window.clearTimeout(
        lockMessageTimer.current,
      );
    }

    lockMessageTimer.current =
      window.setTimeout(() => {
        setShowLockMessage(false);
      }, 4500);
  };

  const [isNavigating, setIsNavigating] =
    useState(false);

  const goToPage = async (page: number) => {
    if (isNavigating) return;

    const nextPage =
      page > pages.length
        ? 1
        : Math.max(0, page);

    if (nextPage > currentPage) {
      setIsNavigating(true);

      try {
        const progress = await fetchProgress();

        setMaxAllowedPage(progress);

        if (nextPage > progress + 1) {
          showLockedMessage();
          return;
        }
      } finally {
        setIsNavigating(false);
      }
    }

    setCurrentPage(nextPage);
    setShowLockMessage(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const retryProgress = async () => {
    if (isNavigating) return;

    setIsNavigating(true);

    try {
      const progress = await fetchProgress();

      setMaxAllowedPage(progress);

      if (currentPage <= progress) {
        setShowLockMessage(false);
        return;
      }

      if (currentPage === progress + 1) {
        setShowLockMessage(false);
        return;
      }

      showLockedMessage();
    } finally {
      setIsNavigating(false);
    }
  };

  const handleGithubIdChange = (
    value: string,
  ) => {
    setGithubId(value);

    saveStorageValue(
      STORAGE_KEYS.githubId,
      value,
    );
  };

  const handleTeamNameChange = (
    value: string,
  ) => {
    setTeamName(value);

    saveStorageValue(
      STORAGE_KEYS.teamName,
      value,
    );
  };

  const handleTeamSizeChange = (
    value: number,
  ) => {
    setTeamSize(value);

    saveStorageValue(
      STORAGE_KEYS.teamSize,
      String(value),
    );

    if (value === 1) {
      setTeamMemberNumber(1);

      saveStorageValue(
        STORAGE_KEYS.teamMember,
        "1",
      );

      return;
    }

    setTeamMemberNumber(
      (currentMember) => {
        if (
          currentMember &&
          currentMember <= value
        ) {
          saveStorageValue(
            STORAGE_KEYS.teamMember,
            String(currentMember),
          );

          return currentMember;
        }

        saveStorageValue(
          STORAGE_KEYS.teamMember,
          "1",
        );

        return 1;
      },
    );
  };

  const handleTeamMemberChange = (
    value: number,
  ) => {
    if (!teamSize) {
      return;
    }

    if (
      value < 1 ||
      value > teamSize
    ) {
      return;
    }

    setTeamMemberNumber(value);

    saveStorageValue(
      STORAGE_KEYS.teamMember,
      String(value),
    );
  };

  return (
    <div
      className={`website ${themes[themeIndex]}`}
    >
      {isNavigating && (
        <div className="navigation-overlay">
          <div className="spinner"></div>
          LOADING...
        </div>
      )}

      {currentPage === 0 ? (
        <HomePage
          onNext={() => goToPage(1)}
          onThemeChange={changeTheme}
          onMemesClick={() => goToPage(9)}
          maxAllowedPage={maxAllowedPage}
          showLockMessage={showLockMessage}
        />
      ) : (
        <ContentPage
          pageIndex={currentPage}
          onPrevious={() =>
            goToPage(currentPage - 1)
          }
          onNext={() =>
            goToPage(currentPage + 1)
          }
          onThemeChange={changeTheme}
          onMemesClick={() => goToPage(9)}
          maxAllowedPage={maxAllowedPage}
          onRetryProgress={retryProgress}
          githubId={githubId}
          teamName={teamName}
          teamSize={teamSize}
          teamMemberNumber={teamMemberNumber}
          onGithubIdChange={
            handleGithubIdChange
          }
          onTeamNameChange={
            handleTeamNameChange
          }
          onTeamSizeChange={
            handleTeamSizeChange
          }
          onTeamMemberChange={
            handleTeamMemberChange
          }
          showLockMessage={showLockMessage}
        />
      )}
    </div>
  );
}

function HomePage({
  onNext,
  onThemeChange,
  onMemesClick,
  maxAllowedPage,
  showLockMessage,
}: {
  onNext: () => void;
  onThemeChange: () => void;
  onMemesClick: () => void;
  maxAllowedPage: number;
  showLockMessage: boolean;
}) {
  return (
    <section className="page home-page">
      <motion.div
        className="main-card home-card"
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.7,
          ease: "easeOut",
        }}
      >
        <Navbar
          onThemeChange={onThemeChange}
          onMemesClick={onMemesClick}
          maxAllowedPage={maxAllowedPage}
        />

        {showLockMessage && (
          <div className="lock-toast">
            THIS AREA IS NOT YET AVAILABLE
            FOR EXPLORATION!
          </div>
        )}

        <main>
          <section className="hero wenoselect">
            <motion.div
              className="hero-content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="hero-left">
                <motion.img
                  className="hero-small-image"
                  src={gitgudheader}
                  alt="GitGud header"
                  variants={itemVariants}
                />

                <motion.h1
                  variants={itemVariants}
                  animate={{
                    rotate: [-2, 0, -2],
                    scale: [1, 1.01, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  GitGud
                </motion.h1>

                <motion.div
                  className="hero-text"
                  variants={itemVariants}
                >
                  <p>
                    Learn Git. Make Memes. Make
                    Your First Contribution.
                  </p>

                  <p>
                    Hosted by OSDC, this fun
                    hands-on session introduces you
                    to Git and GitHub through a
                    shared meme project. No
                    experience needed, just bring
                    your creativity.
                  </p>

                  <motion.button
                    className="bigbutton"
                    onClick={onNext}
                    whileHover={{
                      scale: 1.06,
                      y: -3,
                    }}
                    whileTap={{
                      scale: 0.95,
                      y: 0,
                    }}
                  >
                    Get Started ➜
                  </motion.button>
                </motion.div>
              </div>

              <motion.div
                className="hero-image"
                variants={itemVariants}
                animate={{
                  y: [0, -12, 0],
                  rotate: [-2, 2, -2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <img
                  src={octocat}
                  alt="Octocat"
                />
              </motion.div>
            </motion.div>
          </section>

          <Ticker />

          <motion.section
            className="about"
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            variants={containerVariants}
          >
            <motion.div
              className="about-image"
              variants={itemVariants}
            >
              <motion.div
                className="illustration"
                animate={{
                  y: [0, -12, 0],
                  rotate: [-2, 2, -2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <img
                  src="https://links.osdc.dev/assets/logo-pixel.svg"
                  alt="OSDC"
                />
              </motion.div>
            </motion.div>

            <motion.div
              className="about-text wenoselect"
              variants={itemVariants}
            >
              <h2>About</h2>

              <p>
                We are an Open Source Community
                based in and around Jaypee
                Institute of Information Technology,
                Noida, India.
              </p>

              <p>
                A community of web developers,
                android freaks, machine learning
                enthusiasts, hackers, designers,
                game developers and most
                significantly Explorers.
              </p>

              <p>
                We welcome those who believe in the
                open source philosophy and are
                willing to sacrifice their naps in
                order to change the world.
              </p>

              <motion.a
                className="bigbutton"
                href="https://discord.gg/QUWfMS4HXX"
                whileHover={{
                  scale: 1.06,
                  y: -3,
                }}
                whileTap={{
                  scale: 0.95,
                  y: 0,
                }}
              >
                Say Hello!
              </motion.a>
            </motion.div>
          </motion.section>
        </main>
      </motion.div>
    </section>
  );
}

export default App;