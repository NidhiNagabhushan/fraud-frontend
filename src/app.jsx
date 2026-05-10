import { useState } from "react";
import "./App.css";

const API_URL = "https://credit-card-fraud-detection-sysytem.onrender.com";

export default function App() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed < 0) {
      setError("Please enter a valid transaction amount.");
      return;
    }

    setLoading(true);

    try {
      // Backend needs 29 features, amount goes at index 28
      const features = new Array(29).fill(0);
      features[28] = parsed;

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.prediction); // "Fraud" or "Not Fraud"
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setAmount("");
    setResult(null);
    setError(null);
  }

  const isFraud = result === "Fraud";

  return (
    <main className="app-container">
      <div className="card">

        <div className="card-header">
          <div className="shield-icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3L4 7v5c0 4.418 3.582 8 8 9 4.418-1 8-4.582 8-9V7L12 3z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <h1>Fraud Detection</h1>
          <p className="subtitle">Enter a transaction amount to check if it is fraudulent</p>
        </div>

        {!result && (
          <form onSubmit={handleSubmit} className="form" noValidate>
            <div className="input-group">
              <label htmlFor="amount" className="label">Transaction Amount</label>
              <div className="input-wrapper">
                <span className="currency-symbol">₹</span>
                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="amount-input"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="error-banner" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !amount}
            >
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Analyzing...
                </>
              ) : (
                "Analyze Transaction"
              )}
            </button>
          </form>
        )}

        {result && (
          <div className={`result ${isFraud ? "result-fraud" : "result-safe"}`}>
            <div className="result-icon" aria-hidden="true">
              {isFraud ? (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ) : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3L4 7v5c0 4.418 3.582 8 8 9 4.418-1 8-4.582 8-9V7L12 3z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              )}
            </div>

            <h2 className="result-title">
              {isFraud ? "Fraudulent Transaction" : "Transaction Looks Safe"}
            </h2>
            <p className="result-amount">
              Amount: <strong>
                ₹{parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </strong>
            </p>
            <p className="result-message">
              {isFraud
                ? "This transaction has been flagged as potentially fraudulent. Review it carefully."
                : "No fraud indicators detected. This transaction appears to be legitimate."}
            </p>

            <button onClick={handleReset} className="reset-btn">
              Check Another Transaction
            </button>
          </div>
        )}

      </div>
    </main>
  );
}