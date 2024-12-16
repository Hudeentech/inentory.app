const Nav = ({ setActivePage, activePage }) => (
    <nav className="nav">
        <ul>
            <li
                onClick={() => setActivePage("Dashboard")}
                className={activePage === "Dashboard" ? "active" : ""}
                aria-label="Go to Dashboard"
            >
                <i className="fas fa-chart-simple"></i> <p>Dashboard</p>
            </li>
            <li
                onClick={() => setActivePage("Restock")}
                className={activePage === "Restock" ? "active" : ""}
                aria-label="Go to Restock"
            >
                <i className="fas fa-box-open"></i> <p>Restock</p>
            </li>
            <li
                onClick={() => setActivePage("Store")}
                className={activePage === "Store" ? "active" : ""}
                aria-label="Go to Store"
            >
                <i className="fas fa-store"></i> <p>Store</p>
            </li>
            <li
                onClick={() => setActivePage("Sales")}
                className={activePage === "Sales" ? "active" : ""}
                aria-label="Go to Sales"
            >
                <i className="fas fa-receipt"></i> <p>Sales</p>
            </li>
        </ul>
    </nav>
);

export default Nav;
