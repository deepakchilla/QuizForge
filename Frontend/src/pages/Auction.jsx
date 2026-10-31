
import { useState } from "react";
import {
  ArrowLeft,
  Gavel,
  Plus,
  Trash2,
  Users,
  Wallet,
  Trophy,
  Sparkles,
  Info,
  Package,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const TEAM_COLORS = [
  "#c084fc",
  "#38bdf8",
  "#fbbf24",
  "#34d399",
  "#f87171",
  "#818cf8",
  "#f472b6",
  "#2dd4bf",
  "#fb923c",
  "#a3e635",
];

const DEFAULT_NAMES = [
  "Cyber Dragons",
  "Code Ninjas",
  "Quantum Sparks",
  "Byte Brawlers",
  "Pixel Pirates",
  "Neon Knights",
  "Shadow Hackers",
  "Logic Legends",
  "Algo Aces",
  "Turbo Titans",
];

const createTeam = (index, existingTeams = []) => {
  const usedNames = existingTeams.map((team) =>
    team.name.toLowerCase()
  );

  const name =
    DEFAULT_NAMES.find(
      (candidate) => !usedNames.includes(candidate.toLowerCase())
    ) || `Team ${index + 1}`;

  return {
    id: `${Date.now()}-${Math.random()}`,
    name,
    budget: 100,
  };
};

export default function Auction() {
  const navigate = useNavigate();
  const [auctionName, setAuctionName] = useState("");
  const [teams, setTeams] = useState([
    { id: 1, name: "Cyber Dragons", budget: 100 },
    { id: 2, name: "Code Ninjas", budget: 100 },
  ]);

  const [playerPool, setPlayerPool] = useState(40);
  const [squadSize, setSquadSize] = useState(11);
  const [basePrice, setBasePrice] = useState(2);
  const [bidIncrement, setBidIncrement] = useState(1);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);

  const addTeam = () => {
    if (teams.length >= 10) return;

    setTeams((current) => [
      ...current,
      createTeam(current.length, current),
    ]);
  };

  const removeTeam = (id) => {
    if (teams.length <= 2) return;

    setTeams((current) =>
      current.filter((team) => team.id !== id)
    );
  };

  const updateTeam = (id, field, value) => {
    setTeams((current) =>
      current.map((team) =>
        team.id === id ? { ...team, [field]: value } : team
      )
    );
  };

  const randomizeTeamName = (id) => {
    const currentTeam = teams.find((team) => team.id === id);

    const available = DEFAULT_NAMES.filter(
      (name) =>
        !teams.some(
          (team) =>
            team.id !== id &&
            team.name.trim().toLowerCase() === name.toLowerCase()
        ) &&
        name.toLowerCase() !== currentTeam?.name.trim().toLowerCase()
    );

    if (!available.length) return;

    const chosen =
      available[Math.floor(Math.random() * available.length)];

    updateTeam(id, "name", chosen);
  };

  const totalBudget = teams.reduce(
    (sum, team) => sum + (Number(team.budget) || 0),
    0
  );

    const handleCreateAuction = (event) => {
    event.preventDefault();

    if (!auctionName.trim()) {
        setError("Please enter an auction name.");
        return;
    }

    if (teams.some((team) => !team.name.trim())) {
        setError("Every team must have a name.");
        return;
    }

    const normalizedNames = teams.map((team) =>
        team.name.trim().toLowerCase()
    );

    if (new Set(normalizedNames).size !== normalizedNames.length) {
        setError("Team names must be unique.");
        return;
    }

    if (
        teams.some(
        (team) =>
            !Number.isFinite(Number(team.budget)) ||
            Number(team.budget) <= 0
        )
    ) {
        setError("Every team must have a valid budget.");
        return;
    }

    if (Number(playerPool) < 1 || Number(squadSize) < 1) {
        setError("Player pool and squad size must be at least 1.");
        return;
    }

    if (Number(basePrice) <= 0 || Number(bidIncrement) <= 0) {
        setError("Base price and bid increment must be greater than zero.");
        return;
    }

    const items = JSON.parse(
        localStorage.getItem("quizforge_auction_items") || "[]"
    );

    if (items.length === 0) {
        setError("Please add auction items before starting.");
        return;
    }

    const auctionConfig = {
        auctionName: auctionName.trim(),

        teams: teams.map((team) => ({
        ...team,
        name: team.name.trim(),
        budget: Number(team.budget),
        remainingBudget: Number(team.budget),
        players: [],
        })),

        playerPool: Number(playerPool),
        squadSize: Number(squadSize),
        basePrice: Number(basePrice),
        bidIncrement: Number(bidIncrement),

        items: items.map((item) => ({
        ...item,
        status: "pending",
        })),

        sales: [],
    };

    localStorage.setItem(
        "quizforge_live_auction",
        JSON.stringify(auctionConfig)
    );

    setError("");

    navigate("/auction/live");
    };

  return (
    <main className="page-container auction-page">
      <div className="page-header auction-page-header">
        <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            Back to Home
        </Link>

        <div className="auction-header-actions">
            <Link
            to="/auction/items"
            className="button button-secondary"
            >
            <Package size={16} />
            Manage Items
            </Link>

            <span className="badge-pill">
            <Gavel size={13} />
            AUCTION STUDIO
            </span>
        </div>
     </div>

      <div className="auction-heading">
        <div className="auction-heading-icon">
          <Gavel size={25} />
        </div>
        <h1>Create an Auction</h1>
        <p>
          Set up your teams, budgets and auction rules before
          the bidding begins.
        </p>
      </div>

      <form
        className="auction-layout"
        onSubmit={handleCreateAuction}
      >
        <div className="auction-main">
          {/* Auction details */}
          <section className="studio-card auction-section">
            <div className="auction-section-heading">
              <div className="auction-section-icon purple">
                <Sparkles size={19} />
              </div>
              <div>
                <h2>Auction Details</h2>
                <p>Give your auction an identity.</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="auction-name">Auction Name</label>
              <input
                id="auction-name"
                className="text-input"
                type="text"
                placeholder="e.g. Ultimate Cricket Auction"
                value={auctionName}
                onChange={(e) => setAuctionName(e.target.value)}
                maxLength={100}
              />
            </div>
          </section>

          {/* Teams */}
          <section className="studio-card auction-section">
            <div className="auction-section-heading">
              <div className="auction-section-icon cyan">
                <Users size={19} />
              </div>
              <div>
                <h2>Team Configuration</h2>
                <p>
                  Configure {teams.length} teams and their individual
                  budgets. Maximum 10 teams.
                </p>
              </div>
              <span className="auction-count">
                {teams.length}/10
              </span>
            </div>

            <div className="auction-teams-grid">
              {teams.map((team, index) => (
                <div
                  className="auction-team-card"
                  key={team.id}
                  style={{
                    "--team-accent":
                      TEAM_COLORS[index % TEAM_COLORS.length],
                  }}
                >
                  <div className="auction-team-card-top">
                    <span className="auction-team-number">
                      TEAM {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="auction-team-actions">
                      <button
                        type="button"
                        className="auction-icon-button"
                        title="Generate random team name"
                        onClick={() => randomizeTeamName(team.id)}
                      >
                        <Sparkles size={14} />
                      </button>

                      {teams.length > 2 && (
                        <button
                          type="button"
                          className="auction-icon-button danger"
                          title="Remove team"
                          onClick={() => removeTeam(team.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Team Name</label>
                    <input
                      className="text-input auction-team-name"
                      value={team.name}
                      onChange={(e) =>
                        updateTeam(team.id, "name", e.target.value)
                      }
                      placeholder={`Team ${index + 1}`}
                      maxLength={30}
                    />
                  </div>

                  <div className="form-group auction-budget-field">
                    <label>Team Budget (Credits)</label>
                    <div className="auction-input-with-icon">
                      <Wallet size={16} />
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={team.budget}
                        onChange={(e) =>
                          updateTeam(
                            team.id,
                            "budget",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              {teams.length < 10 && (
                <button
                  type="button"
                  className="auction-add-team"
                  onClick={addTeam}
                >
                  <Plus size={23} />
                  <span>Add Team</span>
                  <small>Create another team</small>
                </button>
              )}
            </div>
          </section>

          {/* Squad and player pool */}
          <section className="studio-card auction-section">
            <div className="auction-section-heading">
              <div className="auction-section-icon amber">
                <Trophy size={19} />
              </div>
              <div>
                <h2>Player Configuration</h2>
                <p>Decide how many players will be available.</p>
              </div>
            </div>

            <div className="auction-fields-grid">
              <div className="form-group">
                <label htmlFor="player-pool">
                  Total Players in Auction Pool
                </label>
                <input
                  id="player-pool"
                  className="text-input"
                  type="number"
                  min="1"
                  value={playerPool}
                  onChange={(e) => setPlayerPool(e.target.value)}
                />
                <small className="auction-field-hint">
                  Total number of players available for bidding.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="squad-size">
                  Players Required Per Team
                </label>
                <input
                  id="squad-size"
                  className="text-input"
                  type="number"
                  min="1"
                  value={squadSize}
                  onChange={(e) => setSquadSize(e.target.value)}
                />
                <small className="auction-field-hint">
                  Maximum squad size for each team.
                </small>
              </div>
            </div>
          </section>

          {/* Bidding rules */}
          <section className="studio-card auction-section">
            <div className="auction-section-heading">
              <div className="auction-section-icon emerald">
                <Wallet size={19} />
              </div>
              <div>
                <h2>Bidding Rules</h2>
                <p>Set the starting price and bid increments.</p>
              </div>
            </div>

            <div className="auction-fields-grid">
              <div className="form-group">
                <label htmlFor="base-price">
                  Default Player Base Price (Credits)
                </label>
                <input
                  id="base-price"
                  className="text-input"
                  type="number"
                  min="0.01"
                  step="any"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bid-increment">
                  Minimum Bid Increment (Credits)
                </label>
                <input
                  id="bid-increment"
                  className="text-input"
                  type="number"
                  min="0.01"
                  step="any"
                  value={bidIncrement}
                  onChange={(e) => setBidIncrement(e.target.value)}
                />
              </div>
            </div>

            <div className="auction-info-note">
              <Info size={17} />
              <p>
                The base price is the starting price for a player.
                Each new bid must increase the current bid by at
                least the minimum increment.
              </p>
            </div>
          </section>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="button button-primary auction-create-button"
          >
            <Gavel size={18} />
            Start Auction
          </button>
        </div>

        {/* Live summary */}
        <aside className="studio-card auction-summary">
          <div className="preview-top">
            <span className="preview-label">LIVE PREVIEW</span>
            <span className="round-label">SETUP</span>
          </div>

          <div className="auction-summary-content">
            <div className="auction-summary-icon">
              <Gavel size={27} />
            </div>

            <h2>
              {auctionName.trim() || "Your Auction"}
            </h2>

            <p className="auction-summary-subtitle">
              Auction Configuration
            </p>

            <div className="auction-summary-stats">
              <div>
                <strong>{teams.length}</strong>
                <span>Teams</span>
              </div>
              <div>
                <strong>{playerPool || 0}</strong>
                <span>Players</span>
              </div>
              <div>
                <strong>{squadSize || 0}</strong>
                <span>Per Squad</span>
              </div>
            </div>

            <div className="auction-summary-divider" />

            <div className="auction-summary-row">
              <span>Total Team Budgets</span>
              <strong>{totalBudget} Credits</strong>
            </div>

            <div className="auction-summary-row">
              <span>Base Price</span>
              <strong>{basePrice || 0} Credits</strong>
            </div>

            <div className="auction-summary-row">
              <span>Bid Increment</span>
              <strong>{bidIncrement || 0} Credits</strong>
            </div>

            <div className="auction-summary-divider" />

            <h3>Participating Teams</h3>

            <div className="auction-summary-team-list">
              {teams.map((team, index) => (
                <div className="auction-summary-team" key={team.id}>
                  <span
                    className="auction-team-dot"
                    style={{
                      background:
                        TEAM_COLORS[index % TEAM_COLORS.length],
                    }}
                  />
                  <span>{team.name.trim() || `Team ${index + 1}`}</span>
                  <strong>{team.budget || 0}</strong>
                </div>
              ))}
            </div>

            <div className="info-box auction-summary-note">
              Your configuration will be used to prepare the
              auction. Player details and live bidding will be
              configured in the next stage.
            </div>
          </div>
        </aside>
      </form>

      {created && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-icon-badge">
              <Gavel size={32} />
            </div>
            <h2 className="modal-title">Setup Validated!</h2>
            <p className="modal-subtitle">
              Your auction configuration is ready for the next
              development stage.
            </p>
            <button
              className="button button-primary"
              type="button"
              onClick={() => setCreated(false)}
            >
              Continue Editing
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
