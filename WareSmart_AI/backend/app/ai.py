import os
from dotenv import load_dotenv

load_dotenv()


def fallback(q, c):
    """
    Simple reliable WareSmart AI.
    Uses the actual warehouse data passed from the backend.
    """

    q = q.lower().strip()

    orders = c.get("orders", [])
    reorders = c.get("reorders", [])
    zones = c.get("zones", [])

    # ---------------------------------------------------------
    # 1. PRIORITY ORDERS
    # ---------------------------------------------------------
    if (
        "prioritize" in q
        or "priority" in q
        or "highest priority" in q
        or "important orders" in q
        or "urgent orders" in q
    ):
        top = sorted(
            orders,
            key=lambda x: x.get("score", 0),
            reverse=True
        )[:5]

        if not top:
            return "There are no orders available."

        lines = ["Top priority orders:"]

        for x in top:
            lines.append(
                f"• {x.get('number')} — "
                f"{x.get('customer')} — "
                f"{x.get('priority')} priority — "
                f"SLA {x.get('sla')}h — "
                f"Score {x.get('score')}"
            )

        return "\n".join(lines)

    # ---------------------------------------------------------
    # 2. URGENT ORDERS
    # ---------------------------------------------------------
    if "urgent" in q or "critical" in q:
        urgent = [
            x for x in orders
            if str(x.get("priority", "")).lower()
            in ["critical", "high"]
        ]

        if not urgent:
            return "There are no urgent orders."

        lines = ["Urgent orders requiring attention:"]

        for x in urgent:
            lines.append(
                f"• {x.get('number')} — "
                f"{x.get('customer')} — "
                f"{x.get('priority')} — "
                f"SLA {x.get('sla')}h"
            )

        return "\n".join(lines)

    # ---------------------------------------------------------
    # 3. REORDER / LOW STOCK
    # ---------------------------------------------------------
    if (
        "reorder" in q
        or "low stock" in q
        or "restock" in q
        or "need stock" in q
        or "need reordering" in q
    ):
        if not reorders:
            return "No products currently require reordering."

        lines = ["Products requiring reorder attention:"]

        for x in reorders:
            lines.append(
                f"• {x.get('product')} — "
                f"Available: {x.get('available')} — "
                f"Reorder level: {x.get('reorder_level')} — "
                f"Recommended quantity: {x.get('recommended_quantity')}"
            )

        return "\n".join(lines)

    # ---------------------------------------------------------
    # 4. OUT OF STOCK
    # ---------------------------------------------------------
    if (
        "out of stock" in q
        or "zero stock" in q
        or "no stock" in q
        or "unavailable" in q
    ):
        out = [
            x for x in reorders
            if str(x.get("status", "")).lower() == "out of stock"
            or x.get("available", 0) == 0
        ]

        if not out:
            return "There are currently no completely out-of-stock products."

        lines = ["Out-of-stock products:"]

        for x in out:
            lines.append(
                f"• {x.get('product')} — "
                f"Available: {x.get('available')} — "
                f"Recommended reorder: {x.get('recommended_quantity')}"
            )

        return "\n".join(lines)

    # ---------------------------------------------------------
    # 5. INVENTORY TOTAL
    # ---------------------------------------------------------
    if (
        "total inventory" in q
        or "how much inventory" in q
        or "inventory do we have" in q
        or "total stock" in q
        or "how many units" in q
    ):
        total = sum(
            x.get("available", 0)
            for x in c.get("products", [])
        )

        if total == 0:
            total = c.get("inventory", 0)

        return f"Current available inventory is {total} units."

    # ---------------------------------------------------------
    # 6. PRODUCT INFORMATION
    # ---------------------------------------------------------
    products = c.get("products", [])

    for product in products:
        name = str(product.get("name", "")).lower()

        if name and name in q:
            return (
                f"{product.get('name')} ({product.get('sku')})\n"
                f"• Category: {product.get('category')}\n"
                f"• Available: {product.get('available')}\n"
                f"• Reserved: {product.get('reserved')}\n"
                f"• Reorder level: {product.get('reorder')}\n"
                f"• Zone: {product.get('zone')}"
            )

    # ---------------------------------------------------------
    # 7. BOTTLENECK / DELAY
    # ---------------------------------------------------------
    if (
        "delay" in q
        or "bottleneck" in q
        or "busy zone" in q
        or "busy area" in q
        or "workload" in q
    ):
        if not zones:
            return "No zone information is currently available."

        busiest = max(
            zones,
            key=lambda x: x.get("utilization", 0)
        )

        return (
            f"Primary bottleneck: Zone {busiest.get('zone')} "
            f"with {busiest.get('utilization')}% utilization.\n\n"
            f"Recommendation: Prioritize work in this zone and "
            f"reassign available capacity if necessary."
        )

    # ---------------------------------------------------------
    # 8. WAREHOUSE HEALTH
    # ---------------------------------------------------------
    if (
        "health" in q
        or "warehouse health" in q
        or "warehouse status" in q
    ):
        health = c.get("health", "unknown")

        return (
            f"Warehouse health is currently {health}%.\n\n"
            f"The system is monitoring inventory, order priority, "
            f"exceptions and zone utilization."
        )

    # ---------------------------------------------------------
    # 9. PENDING ORDERS
    # ---------------------------------------------------------
    if (
        "pending orders" in q
        or "pending order" in q
        or "orders pending" in q
    ):
        pending = [
            x for x in orders
            if str(x.get("status", "")).lower()
            not in ["dispatched", "delivered"]
        ]

        if not pending:
            return "There are no pending orders."

        lines = [
            f"There are {len(pending)} pending orders:"
        ]

        for x in pending:
            lines.append(
                f"• {x.get('number')} — "
                f"{x.get('customer')} — "
                f"{x.get('status')}"
            )

        return "\n".join(lines)

    # ---------------------------------------------------------
    # 10. EXCEPTIONS
    # ---------------------------------------------------------
    if (
        "exception" in q
        or "exceptions" in q
        or "problems" in q
        or "issues" in q
    ):
        if not reorders:
            return "No current inventory exceptions."

        lines = ["Current warehouse exceptions:"]

        for x in reorders:
            lines.append(
                f"• {x.get('product')} — {x.get('status')} — "
                f"Available: {x.get('available')}"
            )

        return "\n".join(lines)

    # ---------------------------------------------------------
    # 11. ORDER COUNT
    # ---------------------------------------------------------
    if (
        "how many orders" in q
        or "number of orders" in q
        or "order count" in q
    ):
        return f"There are currently {len(orders)} orders in the system."

    # ---------------------------------------------------------
    # 12. HELP / UNKNOWN QUESTION
    # ---------------------------------------------------------
    return (
        "I can help with your warehouse operations. Try asking:\n\n"
        "• Which orders should we prioritize?\n"
        "• What products need reordering?\n"
        "• Which product is out of stock?\n"
        "• Where is the biggest bottleneck?\n"
        "• What is our warehouse health?\n"
        "• How many pending orders are there?\n"
        "• Show me the current exceptions.\n"
        "• Tell me about the Wireless Mouse."
    )


def ask(q, c):
    """
    Main Copilot function.

    It first tries Gemini if GEMINI_API_KEY is configured.
    If Gemini is unavailable, the reliable local fallback is used.
    """

    key = os.getenv("GEMINI_API_KEY")

    # If Gemini key is not configured,
    # use our reliable local warehouse assistant.
    if not key:
        return fallback(q, c)

    try:
        from google import genai

        client = genai.Client(api_key=key)

        prompt = f"""
You are WareSmart AI, a warehouse operations assistant.

Answer the user's question using ONLY the warehouse data below.

Warehouse data:
{c}

User question:
{q}

Give a concise and useful answer.
Use bullet points when appropriate.
Do not invent information that is not present in the warehouse data.
"""

        response = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            contents=prompt
        )

        if response and response.text:
            return response.text

        return fallback(q, c)

    except Exception:
        # If Gemini fails for any reason,
        # continue using the local assistant.
        return fallback(q, c)