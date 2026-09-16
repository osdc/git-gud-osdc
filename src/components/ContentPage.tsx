import { motion, type Variants } from "motion/react";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Ticker from "./Ticker";
import { pages, type TerminalStep } from "../pages";
import "./ContentPage.css";
import LONE_WOLF_IMAGE from "../assets/images/lonewolf.jpg";
import { getMemesForTeamSize } from "../data/memes";
import { API_BASE_URL } from "../config";

const STORAGE_KEYS = {
  githubId: "gitgud-github-id",
  teamName: "gitgud-team-name",
  teamSize: "gitgud-team-size",
  memberNumber: "gitgud-member-number",
  selectedTemplate: "gitgud-selected-template",
  keyboardNavigationHintDismissed:
    "gitgud-keyboard-navigation-hint-dismissed",
};

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

type ContentPageProps = {
  pageIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onThemeChange: () => void;
  githubId: string;
  teamName: string;
  teamSize: number | null;
  teamMemberNumber: number | null;
  onGithubIdChange: (value: string) => void;
  onTeamNameChange: (value: string) => void;
  onTeamSizeChange: (value: number) => void;
  onTeamMemberChange: (value: number) => void;
  showLockMessage: boolean;
  onMemesClick: () => void;
  maxAllowedPage: number;
  onRetryProgress: () => void;
};

type SubmittedMeme = {
  team: string;
  imageUrl: string;
};

function readStorage(key: string): string {
  try {
    return localStorage.getItem(key)?.trim() || "";
  } catch {
    return "";
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function getSelectedTemplate(): string {
  return readStorage(STORAGE_KEYS.selectedTemplate);
}

function ArrowButton({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      className="page-arrow"
      onClick={onClick}
      whileHover={{
        scale: 1.08,
        y: direction === "left" ? -2 : 2,
      }}
      whileTap={{
        scale: 0.92,
      }}
      aria-label={
        direction === "left" ? "Previous page" : "Next page"
      }
    >
      {direction === "left" ? "←" : "→"}
    </motion.button>
  );
}

function KeyboardNavigationHint({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  return (
    <div
      className="keyboard-navigation-hint"
      role="status"
      aria-label="Keyboard navigation instructions"
    >
      <button
        type="button"
        className="keyboard-navigation-hint-close"
        onClick={onDismiss}
        aria-label="Dismiss keyboard navigation instructions"
      >
        ×
      </button>

      <div className="keyboard-navigation-hint-content">
        <div className="keyboard-navigation-hint-title">
          NAVIGATION TIP
        </div>

        <div>
          Go back and forth between screens using the navigation
          buttons below, or use
          <span className="keyboard-key">🡸</span>
          and
          <span className="keyboard-key">🡺</span>
          arrow keys.
        </div>
      </div>
    </div>
  );
}

function Terminal({
  steps,
}: {
  steps: TerminalStep[];
}) {
  const [copied, setCopied] = useState<number | null>(null);

  const copyText = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(index);

      window.setTimeout(() => {
        setCopied((current) =>
          current === index ? null : current,
        );
      }, 1600);
    } catch {
      setCopied(null);
    }
  };

  const copyAll = async () => {
    const text = steps.map((step) => step.code).join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(-1);

      window.setTimeout(() => {
        setCopied((current) =>
          current === -1 ? null : current,
        );
      }, 1600);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="terminal">
      <div className="terminal-header">
        <span className="terminal-title">Terminal</span>

        <div className="terminal-actions">
          <button
            type="button"
            className={`terminal-copy${
              copied === -1 ? " is-copied" : ""
            }`}
            onClick={copyAll}
            aria-label="Copy all terminal commands"
          >
            {copied === -1 ? "Copied" : "Copy all"}
          </button>

          <div className="terminal-controls">
            <span
              className="terminal-control terminal-control-red"
              aria-hidden="true"
            />
            <span
              className="terminal-control terminal-control-yellow"
              aria-hidden="true"
            />
            <span
              className="terminal-control terminal-control-green"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div className="terminal-content">
        {steps.map((step, index) => (
          <div
            className="terminal-command"
            key={`${step.label}-${index}`}
          >
            <div className="terminal-label">{step.label}</div>

            <div className="terminal-code">
              <span
                className="terminal-prompt"
                aria-hidden="true"
              >
                $
              </span>

              <code>{step.code}</code>

              <button
                type="button"
                className={`terminal-command-copy${
                  copied === index ? " is-copied" : ""
                }`}
                onClick={() => copyText(step.code, index)}
                aria-label={`Copy ${step.label} command`}
              >
                {copied === index ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemeGallery({
  teamSize,
}: {
  teamSize: number | null;
}) {
  const [selectedTemplate, setSelectedTemplate] =
    useState(getSelectedTemplate);

  const templates = getMemesForTeamSize(teamSize);

  const selectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);

    writeStorage(
      STORAGE_KEYS.selectedTemplate,
      templateId,
    );
  };

  const getSubtitle = () => {
    if (teamSize === 1) {
      return "LONE WOLF • ALL TEMPLATES AVAILABLE";
    }

    if (teamSize === 2) {
      return "2-MEMBER TEAM • 2-CAPTION MEMES";
    }

    if (teamSize === 3) {
      return "3-MEMBER TEAM • 3-CAPTION MEMES";
    }

    return "CHOOSE A TEMPLATE";
  };

  if (templates.length === 0) {
    return (
      <div className="meme-loading">
        NO MEME TEMPLATES FOUND.
      </div>
    );
  }

  return (
    <div className="meme-selector">
      <div className="meme-selector-hint">
        {getSubtitle()}
        {selectedTemplate
          ? ` • SELECTED: ${selectedTemplate}`
          : ""}
      </div>

      <div className="meme-horizontal-scroll">
        {templates.map((template) => {
          const isSelected =
            selectedTemplate === template.id;

          return (
            <button
              type="button"
              key={template.id}
              className={`meme-card${
                isSelected ? " is-selected" : ""
              }`}
              onClick={() =>
                selectTemplate(template.id)
              }
              aria-pressed={isSelected}
            >
              <div className="meme-card-image-wrap">
                {isSelected && (
                  <span className="meme-selected-badge">
                    SELECTED ✓
                  </span>
                )}

                <img
                  className="meme-image"
                  src={template.image}
                  alt={template.name}
                  draggable={false}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src =
                      template.remoteUrl;
                  }}
                />

                <span className="meme-card-name">
                  {template.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

async function fetchSubmittedImages(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/image/get`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch images: ${response.status}`,
    );
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid image response.");
  }

  return data as string[];
}

function SubmittedMemes() {
  const [memes, setMemes] = useState<SubmittedMeme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSubmissions() {
      try {
        setLoading(true);
        setError(false);

        const paths = await fetchSubmittedImages();

        if (cancelled) {
          return;
        }

        const results = paths.map((path) => {
          const imageUrl = path.startsWith("/")
            ? `${API_BASE_URL}${path}`
            : `${API_BASE_URL}/image/raw/${path}`;

          const filename =
            path.split("/").pop() || path;

          const team = filename.replace(
            /\.[^/.]+$/,
            "",
          );

          return {
            team,
            imageUrl,
          };
        });

        setMemes(results);
      } catch (e) {
        if (!cancelled) {
          console.error(
            "loadSubmissions failed (likely CORS or Network Error):",
            e,
          );

          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSubmissions();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="meme-loading">
        CHECKING SUBMISSIONS...
      </div>
    );
  }

  if (error) {
    return (
      <div className="meme-loading">
        COULD NOT LOAD SUBMISSIONS.
      </div>
    );
  }

  if (memes.length === 0) {
    return (
      <div className="meme-loading">
        NO MEMES HAVE BEEN PUSHED YET.
      </div>
    );
  }

  return (
    <div className="submitted-meme-scroll">
      {memes.map((meme) => (
        <div
          className="submitted-meme"
          key={meme.team}
        >
          <div className="submitted-meme-frame">
            <img
              className="meme-image"
              src={meme.imageUrl}
              alt={`Meme ${meme.team}`}
              draggable={false}
              loading="lazy"
            />
          </div>

          <div className="submitted-meme-team">
            {meme.team}
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamMemberPage({
  teamSize,
  teamMemberNumber,
  onTeamMemberChange,
}: {
  teamSize: number | null;
  teamMemberNumber: number | null;
  onTeamMemberChange: (value: number) => void;
}) {
  const effectiveTeamSize =
    teamSize && teamSize >= 1 && teamSize <= 3
      ? teamSize
      : 1;

  const memberChoices = Array.from(
    { length: effectiveTeamSize },
    (_, index) => index + 1,
  );

  if (effectiveTeamSize === 1) {
    return (
      <div className="step-body lone-wolf-body">
        <div className="lone-wolf-message">
          <strong>Lone wolf, all the best!</strong>

          <span>
            You have been assigned as member 1
          </span>

          <span className="caption-work-message">
            You'll work on{" "}
            <strong>caption 1</strong>.
          </span>
        </div>

        <img
          className="lone-wolf-image"
          src={LONE_WOLF_IMAGE}
          alt="Lone wolf"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div className="step-body centered-body">
      <p className="member-selection-title">
        Which team member are you?
      </p>

      <p className="member-selection-hint">
        Click number to select
      </p>

      <div className="choice-list">
        {memberChoices.map((member) => {
          const selected =
            teamMemberNumber === member;

          return (
            <button
              key={member}
              type="button"
              className={
                selected ? "is-selected" : ""
              }
              aria-pressed={selected}
              onClick={() =>
                onTeamMemberChange(member)
              }
            >
              {member}
            </button>
          );
        })}
      </div>

      {teamMemberNumber && (
        <div className="caption-work-message">
          You'll work on{" "}
          <strong>
            caption {teamMemberNumber}
          </strong>
        </div>
      )}
    </div>
  );
}

function IdentityPage({
  githubId,
  teamName,
  onGithubIdChange,
  onTeamNameChange,
}: {
  githubId: string;
  teamName: string;
  onGithubIdChange: (value: string) => void;
  onTeamNameChange: (value: string) => void;
}) {
  const [savedField, setSavedField] = useState<
    "githubId" | "teamName" | null
  >(null);

  const saveField = (
    field: "githubId" | "teamName",
    value: string,
  ) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return;
    }

    if (field === "githubId") {
      onGithubIdChange(trimmedValue);
    } else {
      onTeamNameChange(trimmedValue);
    }

    setSavedField(field);

    window.setTimeout(() => {
      setSavedField((current) =>
        current === field ? null : current,
      );
    }, 1600);
  };

  return (
    <div className="step-body identity-body">
      <div className="identity-fields">
        <div
          className={`identity-field${
            savedField === "githubId"
              ? " is-saved"
              : ""
          }`}
        >
          <input
            className="figma-input"
            type="text"
            name="githubId"
            placeholder="ENTER YOUR GITHUB ID"
            value={githubId}
            onChange={(event) => {
              setSavedField(null);
              onGithubIdChange(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();

                saveField(
                  "githubId",
                  event.currentTarget.value,
                );
              }
            }}
          />

          {savedField === "githubId" && (
            <span className="input-saved">
              SAVED ✓
            </span>
          )}
        </div>

        <div
          className={`identity-field${
            savedField === "teamName"
              ? " is-saved"
              : ""
          }`}
        >
          <input
            className="figma-input"
            type="text"
            name="teamName"
            placeholder="ENTER TEAM NAME"
            value={teamName}
            onChange={(event) => {
              setSavedField(null);
              onTeamNameChange(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();

                saveField(
                  "teamName",
                  event.currentTarget.value,
                );
              }
            }}
          />

          {savedField === "teamName" && (
            <span className="input-saved">
              SAVED ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PageBody({
  content,
  pageIndex,
  githubId,
  teamName,
  teamSize,
  teamMemberNumber,
  onGithubIdChange,
  onTeamNameChange,
  onTeamSizeChange,
  onTeamMemberChange,
}: {
  content: (typeof pages)[number]["content"];
  pageIndex: number;
  githubId: string;
  teamName: string;
  teamSize: number | null;
  teamMemberNumber: number | null;
  onGithubIdChange: (value: string) => void;
  onTeamNameChange: (value: string) => void;
  onTeamSizeChange: (value: number) => void;
  onTeamMemberChange: (value: number) => void;
}) {
  switch (content.kind) {
    case "button":
      return (
        <div className="step-body signup-body">
          <div className="signup-layout">
            <div className="signup-action">
              <a
                className="figma-button"
                href={content.href}
                target="_blank"
                rel="noreferrer"
              >
                {content.text}
              </a>

              {content.image && (
                <img
                  className="signup-image"
                  src={content.image}
                  alt="GitHub signup"
                  draggable={false}
                />
              )}
            </div>
          </div>
        </div>
      );

    case "setup-git":
      return (
        <div className="step-body setup-body">
          <div className="step-highlight">
            {content.highlight}
          </div>

          <div className="setup-options">
            <div className="setup-option">
              <span className="setup-option-label">
                A) Git for Windows:
              </span>

              <a
                className="figma-button setup-download-button"
                href={content.download.href}
                target="_blank"
                rel="noreferrer"
              >
                {content.download.text}
              </a>
            </div>

            <div className="setup-terminal-label">
              B) Execute commands given below:
            </div>
          </div>

          <Terminal
            steps={content.steps.map((step) =>
              step.label === "Set username"
                ? {
                    ...step,
                    code: `git config --global user.name "${
                      githubId || "your_username"
                    }"`,
                  }
                : step,
            )}
          />
        </div>
      );

    case "fork":
      return (
        <div className="step-body fork-body">
          <div className="step-highlight">
            {content.highlight}
          </div>

          <a
            className="figma-button"
            href={content.button.href}
            target="_blank"
            rel="noreferrer"
          >
            {content.button.text}
          </a>

          <Terminal
            steps={content.steps.map((step) =>
              step.label === "Add origin"
                ? {
                    ...step,
                    code: `git remote add origin https://github.com/${githubId}/GitGud`,
                  }
                : step,
            )}
          />
        </div>
      );

    case "identity":
      return (
        <IdentityPage
          githubId={githubId}
          teamName={teamName}
          onGithubIdChange={onGithubIdChange}
          onTeamNameChange={onTeamNameChange}
        />
      );

    case "choices":
      if (pageIndex === 5) {
        return (
          <div className="step-body centered-body">
            <div className="choice-list">
              {content.choices.map((choice) => {
                const size = Number(choice);
                const selected =
                  teamSize === size;

                return (
                  <button
                    key={choice}
                    type="button"
                    className={
                      selected
                        ? "is-selected"
                        : ""
                    }
                    aria-pressed={selected}
                    onClick={() =>
                      onTeamSizeChange(size)
                    }
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      if (pageIndex === 6) {
        return (
          <TeamMemberPage
            teamSize={teamSize}
            teamMemberNumber={teamMemberNumber}
            onTeamMemberChange={onTeamMemberChange}
          />
        );
      }

      return (
        <div className="step-body centered-body">
          {content.description && (
            <p>{content.description}</p>
          )}

          <div className="choice-list">
            {content.choices.map((choice) => (
              <button
                key={choice}
                type="button"
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      );

    case "lone-wolf":
      return (
        <div className="step-body lone-wolf-body">
          <div className="lone-wolf-message">
            <strong>{content.message}</strong>

            <span>
              {content.captionMessage}
            </span>
          </div>

          <img
            className="lone-wolf-image"
            src={content.image}
            alt="Lone wolf"
            draggable={false}
          />
        </div>
      );

    case "memes":
      if (pageIndex === pages.length) {
        return <SubmittedMemes />;
      }

      return <MemeGallery teamSize={teamSize} />;

    case "terminal":
      return (
        <div className="step-body push-body">
          <Terminal steps={content.steps} />
        </div>
      );

    default:
      return null;
  }
}

function LockedPage({
  onPrevious,
  onRetryProgress,
}: {
  onPrevious: () => void;
  onRetryProgress: () => void;
}) {
  return (
    <section className="locked-area">
      <div className="locked-message">
        <div className="locked-icon">🔒</div>

        <h2>
          THIS AREA IS NOT YET
          <br />
          AVAILABLE FOR EXPLORATION!
        </h2>

        <p>
          The next part of GitGud has not been
          unlocked yet. Check back when the
          organisers open it up.
        </p>

        <div className="locked-actions">
          <button
            type="button"
            className="figma-button"
            onClick={onPrevious}
          >
            GO BACK
          </button>

          <button
            type="button"
            className="figma-button"
            onClick={onRetryProgress}
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    </section>
  );
}

export default function ContentPage({
  pageIndex,
  onPrevious,
  onNext,
  onThemeChange,
  onMemesClick,
  maxAllowedPage,
  onRetryProgress,
  githubId,
  teamName,
  teamSize,
  teamMemberNumber,
  onGithubIdChange,
  onTeamNameChange,
  onTeamSizeChange,
  onTeamMemberChange,
  showLockMessage,
}: ContentPageProps) {
  const [showKeyboardHint, setShowKeyboardHint] =
    useState(() => {
      if (window.innerWidth <= 768) {
        return false;
      }

      return (
        readStorage(
          STORAGE_KEYS.keyboardNavigationHintDismissed,
        ) !== "true"
      );
    });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrevious();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [onPrevious, onNext]);

  const dismissKeyboardHint = () => {
    setShowKeyboardHint(false);

    writeStorage(
      STORAGE_KEYS.keyboardNavigationHintDismissed,
      "true",
    );
  };

  const page = pages[pageIndex - 1];
  const locked = pageIndex > maxAllowedPage;

  if (!page) {
    return null;
  }

  if (locked) {
    return (
      <section className="page content-page">
        <div className="content-card">
          <Navbar
            onThemeChange={onThemeChange}
            onMemesClick={onMemesClick}
            maxAllowedPage={maxAllowedPage}
          />

          {showKeyboardHint && (
            <KeyboardNavigationHint
              onDismiss={dismissKeyboardHint}
            />
          )}

          <LockedPage
            onPrevious={onPrevious}
            onRetryProgress={onRetryProgress}
          />

          <Ticker />

          <div className="page-navigation">
            <ArrowButton
              direction="left"
              onClick={onPrevious}
            />

            <div className="page-counter">
              {pageIndex} / {pages.length}
            </div>

            <div
              className="page-arrow page-arrow-placeholder"
              style={{ visibility: "hidden" }}
            >
              →
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page content-page">
      <div className="content-card">
        <Navbar
          onThemeChange={onThemeChange}
          onMemesClick={onMemesClick}
          maxAllowedPage={maxAllowedPage}
        />

        {showKeyboardHint && (
          <KeyboardNavigationHint
            onDismiss={dismissKeyboardHint}
          />
        )}

        {showLockMessage && (
          <div className="lock-toast">
            THIS AREA IS NOT YET AVAILABLE
            FOR EXPLORATION!
          </div>
        )}

        <main className="content-content">
          <motion.div
            className="content-inner"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.span
              className="eyebrow wenoselect"
              variants={itemVariants}
            >
              {page.label}
            </motion.span>

            <motion.h2
              className="wenoselect"
              variants={itemVariants}
            >
              {page.title
                .split("\n")
                .map((line, index) => (
                  <span key={`${line}-${index}`}>
                    {line}
                    <br />
                  </span>
                ))}
            </motion.h2>

            <motion.div
              className="content-placeholder"
              variants={itemVariants}
            >
              <PageBody
                content={page.content}
                pageIndex={pageIndex}
                githubId={githubId}
                teamName={teamName}
                teamSize={teamSize}
                teamMemberNumber={teamMemberNumber}
                onGithubIdChange={onGithubIdChange}
                onTeamNameChange={onTeamNameChange}
                onTeamSizeChange={onTeamSizeChange}
                onTeamMemberChange={
                  onTeamMemberChange
                }
              />
            </motion.div>
          </motion.div>
        </main>

        <Ticker />

        <div className="page-navigation">
          <ArrowButton
            direction="left"
            onClick={onPrevious}
          />

          <div className="page-counter">
            {pageIndex} / {pages.length}
          </div>

          <ArrowButton
            direction="right"
            onClick={onNext}
          />
        </div>
      </div>
    </section>
  );
}