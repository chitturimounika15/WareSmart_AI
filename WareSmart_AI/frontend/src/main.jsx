import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = "http://127.0.0.1:8000";

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // AI COPILOT
  const [copilotQuestion, setCopilotQuestion] = useState("");
  const [copilotAnswer, setCopilotAnswer] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);

  // Order action state
  const [actionLoading, setActionLoading] = useState(null);

  // --------------------------------------------------
  // LOAD DASHBOARD DATA
  // --------------------------------------------------

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [dashboardRes, productsRes, ordersRes] = await Promise.all([
        fetch(`${API}/api/dashboard`),
        fetch(`${API}/api/products`),
        fetch(`${API}/api/orders`)
      ]);

      if (!dashboardRes.ok) {
        throw new Error("Dashboard API failed");
      }

      if (!productsRes.ok) {
        throw new Error("Products API failed");
      }

      if (!ordersRes.ok) {
        throw new Error("Orders API failed");
      }

      const dashboardData = await dashboardRes.json();
      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      setDashboard(dashboardData);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to the WareSmart backend. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------
  // AI COPILOT
  // --------------------------------------------------

  async function askCopilot(question) {
    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      return;
    }

    setCopilotQuestion(cleanQuestion);
    setCopilotLoading(true);
    setCopilotAnswer("");

    try {
      const response = await fetch(`${API}/api/copilot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          message: cleanQuestion
        })
      });

      if (!response.ok) {
        throw new Error(`Copilot request failed: ${response.status}`);
      }

      const data = await response.json();

      setCopilotAnswer(
        data.answer || "The AI did not return an answer."
      );
    } catch (err) {
      console.error("Copilot error:", err);

      setCopilotAnswer(
        "Sorry, I could not connect to WareSmart AI. Please make sure the backend is running."
      );
    } finally {
      setCopilotLoading(false);
    }
  }

  // --------------------------------------------------
  // ORDER ALLOCATION
  // --------------------------------------------------

  async function allocateOrder(orderId) {
    try {
      setActionLoading(`allocate-${orderId}`);

      const response = await fetch(
        `${API}/api/orders/${orderId}/allocate`,
        {
          method: "POST",
          headers: {
            Accept: "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error("Allocation failed");
      }

      await response.json();

      // Refresh dashboard after allocation
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Unable to allocate this order.");
    } finally {
      setActionLoading(null);
    }
  }

  // --------------------------------------------------
  // UPDATE ORDER STATUS
  // --------------------------------------------------

  async function updateOrderStatus(orderId, status) {
    try {
      setActionLoading(`status-${orderId}`);

      const response = await fetch(
        `${API}/api/orders/${orderId}/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            status: status
          })
        }
      );

      if (!response.ok) {
        throw new Error("Status update failed");
      }

      await response.json();

      await loadData();
    } catch (err) {
      console.error(err);
      alert("Unable to update order status.");
    } finally {
      setActionLoading(null);
    }
  }

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <div className="loading-icon">📦</div>
          <h1>WareSmart AI</h1>
          <p>Loading warehouse intelligence...</p>
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR SCREEN
  // --------------------------------------------------

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-card">
          <div className="error-icon">⚠️</div>

          <h1>WareSmart AI</h1>

          <p>{error}</p>

          <button className="primary-button" onClick={loadData}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // CALCULATED DATA
  // --------------------------------------------------

  const health = dashboard?.health ?? 0;
  const inventory = dashboard?.inventory ?? 0;
  const pending = dashboard?.pending ?? 0;
  const urgent = dashboard?.urgent ?? 0;

  const reorders = dashboard?.reorders || [];

  const priorityOrders = [...orders].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">📦</div>

          <div>
            <h2>WareSmart</h2>
            <span>AI Warehouse</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <a className="active">
            📊 Dashboard
          </a>

          <a>
            📦 Inventory
          </a>

          <a>
            🛒 Orders
          </a>

          <a>
            🚨 Exceptions
          </a>

          <a>
            🤖 AI Copilot
          </a>

          <a>
            📈 Analytics
          </a>

        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="green-dot"></span>
            System Operational
          </div>
        </div>

      </aside>

      {/* MAIN */}

      <main className="main">

        {/* HEADER */}

        <header className="header">

          <div>
            <h1>Warehouse Command Center</h1>

            <p>
              AI-powered operations & fulfillment intelligence
            </p>
          </div>

          <div className="header-actions">

            <span className="live-badge">
              <span className="live-dot"></span>
              LIVE
            </span>

            <button
              className="refresh-button"
              onClick={loadData}
            >
              🔄 Refresh
            </button>

          </div>

        </header>

        {/* KPI CARDS */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon blue">
              📦
            </div>

            <div>
              <span>Total Inventory</span>
              <strong>{inventory}</strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon purple">
              🛒
            </div>

            <div>
              <span>Pending Orders</span>
              <strong>{pending}</strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon red">
              🚨
            </div>

            <div>
              <span>Urgent Orders</span>
              <strong>{urgent}</strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon green">
              ❤️
            </div>

            <div>
              <span>Warehouse Health</span>
              <strong>{health}%</strong>
            </div>

          </div>

        </section>

        {/* PRIORITY ORDERS */}

        <section className="section-card">

          <div className="section-header">

            <div>
              <h2>Priority Orders</h2>
              <p>AI-ranked fulfillment queue</p>
            </div>

            <span className="count-badge">
              {priorityOrders.length} orders
            </span>

          </div>

          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Priority</th>
                  <th>SLA</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {priorityOrders.map((order) => (

                  <tr key={order.id}>

                    <td>
                      <strong>{order.number}</strong>
                    </td>

                    <td>
                      {order.customer}
                    </td>

                    <td>
                      <span
                        className={`priority ${
                          order.priority?.toLowerCase()
                        }`}
                      >
                        {order.priority}
                      </span>
                    </td>

                    <td>
                      {order.sla}h
                    </td>

                    <td>

                      <span className="score">
                        {order.score}
                      </span>

                    </td>

                    <td>

                      <span
                        className={`status ${
                          order.status
                            ?.toLowerCase()
                            .replace(/\s+/g, "-")
                        }`}
                      >
                        {order.status}
                      </span>

                    </td>

                    <td>

                      <div className="order-actions">

                        {order.status === "Created" && (

                          <button
                            className="small-button"
                            disabled={
                              actionLoading ===
                              `allocate-${order.id}`
                            }
                            onClick={() =>
                              allocateOrder(order.id)
                            }
                          >
                            {actionLoading ===
                            `allocate-${order.id}`
                              ? "..."
                              : "Allocate"}
                          </button>

                        )}

                        <select
                          value={order.status}
                          disabled={
                            actionLoading ===
                            `status-${order.id}`
                          }
                          onChange={(e) =>
                            updateOrderStatus(
                              order.id,
                              e.target.value
                            )
                          }
                        >

                          <option value="Created">
                            Created
                          </option>

                          <option value="Allocated">
                            Allocated
                          </option>

                          <option value="picking">
                            Picking
                          </option>

                          <option value="packing">
                            Packing
                          </option>

                          <option value="Quality Check">
                            Quality Check
                          </option>

                          <option value="Dispatched">
                            Dispatched
                          </option>

                          <option value="Awaiting Stock">
                            Awaiting Stock
                          </option>

                        </select>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

        {/* TWO COLUMN AREA */}

        <div className="two-column">

          {/* EXCEPTIONS */}

          <section className="section-card">

            <div className="section-header">

              <div>
                <h2>Exceptions</h2>
                <p>Requires attention</p>
              </div>

              <span className="exception-count">
                {reorders.length}
              </span>

            </div>

            <div className="exception-list">

              {reorders.length === 0 ? (

                <div className="empty-state">
                  ✅ No inventory exceptions
                </div>

              ) : (

                reorders.map((item) => (

                  <div
                    className="exception-item"
                    key={item.product_id}
                  >

                    <div className="exception-icon">
                      ⚠️
                    </div>

                    <div>

                      <strong>
                        {item.product}
                      </strong>

                      <p>
                        {item.status === "Out of Stock"
                          ? "Out of stock"
                          : `Only ${item.available} units available`}
                      </p>

                    </div>

                  </div>

                ))

              )}

            </div>

          </section>

          {/* ZONES */}

          <section className="section-card">

            <div className="section-header">

              <div>
                <h2>Warehouse Zones</h2>
                <p>Current workload</p>
              </div>

            </div>

            <div className="zones">

              {(dashboard?.zones || []).map((zone) => (

                <div
                  className="zone"
                  key={zone.zone}
                >

                  <div className="zone-top">

                    <strong>
                      Zone {zone.zone}
                    </strong>

                    <span>
                      {zone.utilization}%
                    </span>

                  </div>

                  <div className="progress">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${zone.utilization}%`
                      }}
                    ></div>
                  </div>

                  <small>
                    {zone.workload} / {zone.capacity} workload
                  </small>

                </div>

              ))}

            </div>

          </section>

        </div>

        {/* INVENTORY */}

        <section className="section-card">

          <div className="section-header">

            <div>
              <h2>Inventory Monitor</h2>
              <p>Real-time stock visibility</p>
            </div>

            <span className="count-badge">
              {products.length} products
            </span>

          </div>

          <div className="inventory-grid">

            {products.map((product) => {

              let stockStatus = "HEALTHY";

              if (product.available === 0) {
                stockStatus = "OUT OF STOCK";
              } else if (
                product.available <= product.reorder
              ) {
                stockStatus = "LOW STOCK";
              }

              return (

                <div
                  className="inventory-card"
                  key={product.id}
                >

                  <div className="inventory-top">

                    <span className="zone-label">
                      📦 Zone {product.zone}
                    </span>

                    <span
                      className={`stock-status ${
                        stockStatus === "HEALTHY"
                          ? "healthy"
                          : stockStatus === "LOW STOCK"
                          ? "low"
                          : "out"
                      }`}
                    >
                      {stockStatus}
                    </span>

                  </div>

                  <h3>
                    {product.name}
                  </h3>

                  <span className="sku">
                    {product.sku}
                  </span>

                  <div className="inventory-number">

                    <span>
                      Available
                    </span>

                    <strong>
                      {product.available}
                    </strong>

                  </div>

                  <div className="inventory-footer">

                    <span>
                      Stock: {product.stock}
                    </span>

                    <span>
                      Reorder: {product.reorder}
                    </span>

                  </div>

                </div>

              );

            })}

          </div>

        </section>

        {/* AI COPILOT */}

        <section className="copilot-card">

          <div className="copilot-header">

            <div className="copilot-icon">
              🤖
            </div>

            <div>

              <h2>
                WareSmart AI Copilot
              </h2>

              <p>
                Your warehouse decision assistant. Ask about
                inventory, urgent orders, allocation or
                operational bottlenecks.
              </p>

            </div>

          </div>

          {/* QUICK QUESTIONS */}

          <div className="quick-questions">

            <button
              onClick={() =>
                askCopilot(
                  "Which orders should we prioritize?"
                )
              }
            >
              Which orders should we prioritize?
            </button>

            <button
              onClick={() =>
                askCopilot(
                  "What products need reordering?"
                )
              }
            >
              What products need reordering?
            </button>

            <button
              onClick={() =>
                askCopilot(
                  "Where is the biggest bottleneck?"
                )
              }
            >
              Where is the biggest bottleneck?
            </button>

          </div>

          {/* INPUT */}

          <div className="copilot-input">

            <input
              type="text"
              value={copilotQuestion}
              onChange={(e) =>
                setCopilotQuestion(e.target.value)
              }
              onKeyDown={(e) => {

                if (e.key === "Enter") {
                  askCopilot(copilotQuestion);
                }

              }}
              placeholder="Ask WareSmart AI anything about your warehouse..."
            />

            <button
              onClick={() =>
                askCopilot(copilotQuestion)
              }
              disabled={
                copilotLoading ||
                !copilotQuestion.trim()
              }
            >
              {copilotLoading
                ? "Thinking..."
                : "Ask AI"}
            </button>

          </div>

          {/* AI LOADING */}

          {copilotLoading && (

            <div className="copilot-answer loading-answer">

              <div className="ai-avatar">
                🤖
              </div>

              <div>

                <strong>
                  WareSmart AI
                </strong>

                <p>
                  Analyzing warehouse data...
                </p>

              </div>

            </div>

          )}

          {/* AI ANSWER */}

          {copilotAnswer && !copilotLoading && (

            <div className="copilot-answer">

              <div className="ai-avatar">
                🤖
              </div>

              <div>

                <strong>
                  WareSmart AI
                </strong>

                <p>
                  {copilotAnswer}
                </p>

              </div>

            </div>

          )}

        </section>

        {/* FOOTER */}

        <footer>

          <span>
            WareSmart AI
          </span>

          <span>
            Smart Warehouse Decision System
          </span>

        </footer>

      </main>

    </div>
  );
}

createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);