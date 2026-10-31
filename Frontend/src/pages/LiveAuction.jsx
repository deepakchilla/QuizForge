
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Gavel,
  Wallet,
  Users,
  Trophy,
  Package,
  Plus,
  CheckCircle,
  XCircle,
  History,
  ImagePlus,
  AlertCircle,
} from "lucide-react";

const STORAGE_KEY = "quizforge_live_auction";

function LiveAuction() {
  const navigate = useNavigate();

  const [auction, setAuction] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

      if (!saved) return null;

      return {
        ...saved,
        teams: saved.teams.map((team) => ({
          ...team,
          remainingBudget:
            Number(team.remainingBudget ?? team.budget),
          players: team.players || [],
        })),
        items: saved.items.map((item) => ({
          ...item,
          status: item.status || "pending",
        })),
        sales: saved.sales || [],
      };
    } catch {
      return null;
    }
  });

  const [currentBid, setCurrentBid] = useState(0);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [message, setMessage] = useState("");

  // Save auction progress automatically.
  useEffect(() => {
    if (auction) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auction));
    }
  }, [auction]);

  useEffect(() => {
    if (!auction) {
      navigate("/auction", { replace: true });
    }
  }, [auction, navigate]);

  // Find the next item that has not been sold or marked unsold.
  const currentItem =
    auction?.items.find((item) => item.status === "pending") || null;

  // Reset bid and selected team whenever the current item changes.
  useEffect(() => {
    if (currentItem) {
      setCurrentBid(Number(currentItem.basePrice ?? auction.basePrice));
      setSelectedTeamId("");
      setMessage("");
    }
  }, [currentItem?.id]);

  if (!auction) return null;

  const selectedTeam = auction.teams.find(
    (team) => String(team.id) === String(selectedTeamId)
  );

  const soldCount = auction.items.filter(
    (item) => item.status === "sold"
  ).length;

  const unsoldCount = auction.items.filter(
    (item) => item.status === "unsold"
  ).length;

  const completedCount = soldCount + unsoldCount;

  const isFinished = !currentItem;

  const formatCredits = (value) =>
    Number(value || 0).toLocaleString("en-IN");

  const handleIncreaseBid = () => {
    if (!currentItem) return;

    const nextBid = Number(currentBid) + Number(auction.bidIncrement);

    setCurrentBid(nextBid);
    setMessage("");
  };

  const handleSale = () => {
    if (!currentItem) return;

    if (!selectedTeam) {
      setMessage("Please select the winning team.");
      return;
    }

    if (Number(currentBid) < Number(currentItem.basePrice)) {
      setMessage("The bid cannot be lower than the base price.");
      return;
    }

    if (Number(currentBid) > selectedTeam.remainingBudget) {
      setMessage("This team does not have enough remaining budget.");
      return;
    }

    if (selectedTeam.players.length >= Number(auction.squadSize)) {
      setMessage("This team has already reached its squad limit.");
      return;
    }

    setAuction((previous) => {
      const winningTeam = previous.teams.find(
        (team) => String(team.id) === String(selectedTeamId)
      );

      if (
        !winningTeam ||
        winningTeam.remainingBudget < Number(currentBid) ||
        winningTeam.players.length >= Number(previous.squadSize)
      ) {
        return previous;
      }

      const sale = {
        itemId: currentItem.id,
        itemName: currentItem.name,
        teamId: winningTeam.id,
        teamName: winningTeam.name,
        price: Number(currentBid),
        date: new Date().toISOString(),
      };

      return {
        ...previous,

        teams: previous.teams.map((team) =>
          String(team.id) === String(selectedTeamId)
            ? {
                ...team,
                remainingBudget:
                  team.remainingBudget - Number(currentBid),
                players: [...team.players, currentItem.id],
              }
            : team
        ),

        items: previous.items.map((item) =>
          item.id === currentItem.id
            ? {
                ...item,
                status: "sold",
                soldPrice: Number(currentBid),
                soldTo: winningTeam.name,
              }
            : item
        ),

        sales: [...previous.sales, sale],
      };
    });

    setMessage("");
    setSelectedTeamId("");
  };

  const handleUnsold = () => {
    if (!currentItem) return;

    setAuction((previous) => ({
      ...previous,
      items: previous.items.map((item) =>
        item.id === currentItem.id
          ? { ...item, status: "unsold" }
          : item
      ),
    }));

    setMessage("");
  };

  const handleResetAuction = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset the auction? All sales and budget deductions will be lost."
    );

    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEY);
    navigate("/auction");
  };

  return (
    <main className="live-auction-page">
      <div className="live-auction-container">

        {/* Header */}
        <header className="live-auction-header">
          <div>
            <button
              className="back-link"
              onClick={() => navigate("/auction")}
            >
              <ArrowLeft size={17} />
              Back to Setup
            </button>

            <span className="badge-pill live-host-badge">
              <Gavel size={14} />
              HOST CONTROL
            </span>

            <h1>{auction.auctionName}</h1>

            <p>Manage your auction and control every sale.</p>
          </div>

          <button
            className="button button-secondary"
            onClick={handleResetAuction}
          >
            Reset Auction
          </button>
        </header>

        {/* Auction statistics */}
        <section className="live-auction-stats">
          <div className="studio-card live-stat-card">
            <Package size={21} />
            <div>
              <strong>{auction.items.length}</strong>
              <span>Total Items</span>
            </div>
          </div>

          <div className="studio-card live-stat-card">
            <CheckCircle size={21} />
            <div>
              <strong>{soldCount}</strong>
              <span>Sold</span>
            </div>
          </div>

          <div className="studio-card live-stat-card">
            <XCircle size={21} />
            <div>
              <strong>{unsoldCount}</strong>
              <span>Unsold</span>
            </div>
          </div>

          <div className="studio-card live-stat-card">
            <Trophy size={21} />
            <div>
              <strong>{completedCount}/{auction.items.length}</strong>
              <span>Completed</span>
            </div>
          </div>
        </section>

        {/* Current item and bidding controls */}
        {isFinished ? (
          <section className="studio-card live-auction-finished">
            <Trophy size={48} />
            <h2>Auction Completed!</h2>
            <p>All items have been sold or marked as unsold.</p>
          </section>
        ) : (
          <section className="live-auction-main">

            {/* Current item */}
            <div className="studio-card live-current-item">
              <div className="live-section-heading">
                <div>
                  <span className="live-overline">NOW ON AUCTION</span>
                  <h2>Current Item</h2>
                </div>

                <span className="badge-pill">
                  {completedCount + 1} / {auction.items.length}
                </span>
              </div>

              <div className="live-item-image">
                {currentItem.image ? (
                  <img src={currentItem.image} alt={currentItem.name} />
                ) : (
                  <div className="live-no-image">
                    <ImagePlus size={45} />
                    <span>No image available</span>
                  </div>
                )}
              </div>

              <div className="live-item-details">
                <h2>{currentItem.name}</h2>

                <p>
                  {currentItem.description ||
                    "No description provided."}
                </p>

                <div className="live-base-price">
                  <span>Base Price</span>
                  <strong>
                    ₹{formatCredits(currentItem.basePrice)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Bidding controls */}
            <div className="studio-card live-bidding-panel">
              <div className="live-section-heading">
                <div>
                  <span className="live-overline">HOST CONTROLS</span>
                  <h2>Bidding Panel</h2>
                </div>
                <Gavel size={23} />
              </div>

              <div className="live-current-bid">
                <span>Current Bid</span>
                <strong>₹{formatCredits(currentBid)}</strong>
                <small>
                  Increment: ₹{formatCredits(auction.bidIncrement)}
                </small>
              </div>

              <button
                className="button button-primary live-increment-button"
                onClick={handleIncreaseBid}
              >
                <Plus size={18} />
                Increase Bid (+₹{formatCredits(auction.bidIncrement)})
              </button>

              <div className="form-group live-team-select">
                <label htmlFor="winning-team">
                  Select Winning Team
                </label>

                <select
                  id="winning-team"
                  className="text-input"
                  value={selectedTeamId}
                  onChange={(e) => {
                    setSelectedTeamId(e.target.value);
                    setMessage("");
                  }}
                >
                  <option value="">Choose a team</option>

                  {auction.teams.map((team) => (
                    <option
                      key={team.id}
                      value={team.id}
                      disabled={
                        team.remainingBudget < Number(currentBid) ||
                        team.players.length >= Number(auction.squadSize)
                      }
                    >
                      {team.name} — ₹
                      {formatCredits(team.remainingBudget)} remaining
                    </option>
                  ))}
                </select>
              </div>

              {selectedTeam && (
                <div className="live-selected-team">
                  <Users size={18} />
                  <div>
                    <strong>{selectedTeam.name}</strong>
                    <span>
                      ₹{formatCredits(selectedTeam.remainingBudget)} available
                    </span>
                  </div>
                </div>
              )}

              {message && (
                <p className="form-error live-auction-error">
                  <AlertCircle size={16} />
                  {message}
                </p>
              )}

              <div className="live-sale-actions">
                <button
                  className="button button-primary"
                  onClick={handleSale}
                >
                  <CheckCircle size={17} />
                  Confirm Sale
                </button>

                <button
                  className="button button-secondary"
                  onClick={handleUnsold}
                >
                  <XCircle size={17} />
                  Mark Unsold
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Team budgets */}
        <section className="studio-card live-teams-section">
          <div className="live-section-heading">
            <div>
              <span className="live-overline">TEAM OVERVIEW</span>
              <h2>Team Budgets</h2>
            </div>
            <Wallet size={23} />
          </div>

          <div className="live-teams-grid">
            {auction.teams.map((team) => {
              const spent = Number(team.budget) -
                Number(team.remainingBudget);

              const percentage = Math.max(
                0,
                Math.min(100, (spent / Number(team.budget)) * 100)
              );

              return (
                <article className="live-team-card" key={team.id}>
                  <div className="live-team-card-heading">
                    <h3>{team.name}</h3>
                    <span>{team.players.length} items</span>
                  </div>

                  <div className="live-budget-values">
                    <div>
                      <span>Remaining</span>
                      <strong>
                        ₹{formatCredits(team.remainingBudget)}
                      </strong>
                    </div>

                    <div>
                      <span>Spent</span>
                      <strong>₹{formatCredits(spent)}</strong>
                    </div>
                  </div>

                  <div className="live-budget-track">
                    <div
                      className="live-budget-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <small>
                    Original budget: ₹{formatCredits(team.budget)}
                  </small>
                </article>
              );
            })}
          </div>
        </section>

        {/* Sale history */}
        <section className="studio-card live-history-section">
          <div className="live-section-heading">
            <div>
              <span className="live-overline">AUCTION RECORD</span>
              <h2>Sale History</h2>
            </div>
            <History size={23} />
          </div>

          {auction.sales.length === 0 ? (
            <div className="live-history-empty">
              <History size={32} />
              <p>No sales yet. Confirm a sale to see it here.</p>
            </div>
          ) : (
            <div className="live-history-table-wrapper">
              <table className="live-history-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Winning Team</th>
                    <th>Sold Price</th>
                  </tr>
                </thead>

                <tbody>
                  {[...auction.sales].reverse().map((sale, index) => (
                    <tr key={`${sale.itemId}-${index}`}>
                      <td>{sale.itemName}</td>
                      <td>{sale.teamName}</td>
                      <td>₹{formatCredits(sale.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

export default LiveAuction;
