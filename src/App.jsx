import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Navbar from './Navbar';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-enterprise';

const NewRowModal = ({ isOpen, onSave, onClose, editRow }) => {
  const [newRow, setNewRow] = useState({ make: '', model: '', price: '' });

  useEffect(() => {
    if (isOpen) {
      setNewRow(editRow ? { ...editRow } : { make: '', model: '', price: '' });
    }
  }, [editRow, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRow(prevRow => ({ ...prevRow, [name]: value }));
  };

  const handleSubmit = () => {
    onSave({ ...newRow, price: Number(newRow.price) });
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', zIndex: 1000 }}>
      <div>
        <label>Make:</label>
        <input type="text" name="make" value={newRow.make} onChange={handleChange} />
      </div>
      <div>
        <label>Model:</label>
        <input type="text" name="model" value={newRow.model} onChange={handleChange} />
      </div>
      <div>
        <label>Price:</label>
        <input type="number" name="price" value={newRow.price} onChange={handleChange} />
      </div>
      <button onClick={handleSubmit}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

const App = () => {
  const gridRef = useRef(null);
  const [rowData, setRowData] = useState([
    { id: 1, make: 'Toyota', model: 'Celica', price: 35000 },
  { id: 2, make: 'Ford', model: 'Mondeo', price: 32000 },
  { id: 3, make: 'Porsche', model: 'Boxster', price: 72000 },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearchChange = (searchValue) => {
    gridRef.current.api.setQuickFilter(searchValue);
  };

  const handleAddNewClick = () => {
    setSelectedRowData(null); // Explicitly clear any selection
    setIsModalOpen(true);
  };

  const handleSaveNewRow = (newOrUpdatedRow) => {
    if (newOrUpdatedRow.id) {
      // Editing existing row
      const updatedRows = rowData.map(row => row.id === newOrUpdatedRow.id ? newOrUpdatedRow : row);
      setRowData(updatedRows);
    } else {
      // Adding a new row, ensure a unique `id` is assigned
      const newId = rowData.length > 0 ? Math.max(...rowData.map(r => r.id)) + 1 : 1;
      setRowData([...rowData, { ...newOrUpdatedRow, id: newId }]);
    }
    setIsModalOpen(false);
    setSelectedRowData(null); // Reset selected row after save
  };

  const handleEditClick = (rowData) => {
    setSelectedRowData(rowData); // This should include the `id`
    setIsModalOpen(true);
  };

  const handleDeleteClick = (rowData) => {
    setRowData(currentRows => currentRows.filter(row => row !== rowData));
  };

  //Added the onRowClicked code below for returning row ID
  // const onRowClicked = (event) => {
  //   // Assuming each row data has an 'id' field
  //   alert(event.data.id);
  // };

  const onExportClick = () => {
    gridRef.current.api.exportDataAsExcel();
  };

  const ActionsCellRenderer = (props) => {
    return (
      <div>
        <button onClick={() => handleEditClick(props.data)} style={{
          marginRight: 5, 
          border: 'none', 
          background: 'none', 
          cursor: 'pointer',
          color: '#272D3B' // Sets the color for both icons
        }}>
          <i className="fas fa-edit"></i> {/* Font Awesome Edit Icon */}
        </button>
        <button onClick={() => handleDeleteClick(props.data)} style={{
          border: 'none', 
          background: 'none', 
          cursor: 'pointer',
          color: '#272D3B' // Ensures consistent color styling
        }}>
          <i className="fas fa-trash"></i> {/* Font Awesome Trash Icon */}
        </button>
      </div>
    );
};

  const [selectedRowData, setSelectedRowData] = useState(null);

  const [columnDefs] = useState([
    { field: 'make', flex: 1, minWidth: 100 }, // Adjust minWidth as needed
    { field: 'model', flex: 1, minWidth: 100 }, // Adjust minWidth as needed
    { field: 'price', flex: 1, minWidth: 100 }, // Adjust minWidth as needed
    {
      headerName: 'Actions',
      cellRenderer: ActionsCellRenderer,
      editable: false,
      filter: false,
      sortable: false,
      minWidth: 180
    }
  ]);
  

  return (
    <div className="page-container">
      <Navbar onSearchChange={handleSearchChange} />
      <div className="grid-toolbar">
        <button className='btn' onClick={handleAddNewClick}>Add New</button>
        <button className='btn' onClick={onExportClick}>Export to Excel</button>
      </div>
      <NewRowModal isOpen={isModalOpen} onSave={handleSaveNewRow} onClose={() => setIsModalOpen(false)} editRow={selectedRowData} />
      <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          columnDefs={columnDefs}
          rowData={rowData}
          domLayout='autoHeight'
          rowSelection="single"
          //Added the line below for returning row ID
  // onRowClicked={onRowClicked}
        ></AgGridReact>
      </div>
    </div>
  );
};

export default App;
