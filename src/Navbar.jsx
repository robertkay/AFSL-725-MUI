const Navbar = ({ onSearchChange }) => {
  return (
    <div className="form-inline ml-3 oa-search-nav">
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
  );
};

export default Navbar;