const Navbar = ({ onSearchChange }) => {
  return (
    <div className="form-inline ml-3 oa-search-nav">
      <div className="left-section">
      <div className="hamburger-menu">&#9776;</div>
      <div className="navbar-heading">
        <h2>Issues</h2>
      </div>
      <div className="input-group input-group-sm">
        <input
          className="form-control form-control-navbar"
          id="issues-main-search"
          type="search"
          placeholder="Search Issues..."
          aria-label="Search Issues..."
          onChange={(e) => onSearchChange(e.target.value)} // Use the passed prop here
        />
        </div>
      </div>
      <div className="navbar-icons">
      <span>
          <i className="fas fa-columns" title="Open Help Inbox"></i>
        </span>
      <span>
          <i className="fas fa-inbox" title="Open Help Inbox"></i>
        </span>
        <span>
          <i className="fa fa-question-circle" title="Open Help Inbox"></i>
        </span>
        <span>
          <i className="far fa-bell" title="Open Help Inbox"></i>
        </span>
        <span className="user-icon">RK</span>
      </div>
    </div>
  );
};

export default Navbar;