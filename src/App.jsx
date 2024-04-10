import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './Navbar';
import axios from 'axios';
// import { DataGrid } from '@mui/x-data-grid';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import * as XLSX from 'xlsx'; // Import SheetJS

const NewRowModal = ({ isOpen, onSave, onClose, editRow }) => {
  const [newRow, setNewRow] = useState({ reference: '', title: '' });

  useEffect(() => {
    if (isOpen) {
      // Check if editRow has the properties issue_reference and issue_title
      // and map them to reference and title respectively
      setNewRow(editRow ? {
        ...editRow,
        reference: editRow.issue_reference || editRow.reference,
        title: editRow.issue_title || editRow.title
      } : { reference: '', title: '' });
    }
  }, [editRow, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRow(prevRow => ({ ...prevRow, [name]: value }));
  };

  const handleSubmit = () => {
    onSave({
      ...newRow,
      id: editRow?.id,
      issue_reference: newRow.reference, // Ensure this matches the `field` in your columns
      issue_title: newRow.title, // Ensure this matches the `field` in your columns
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Add/Edit Row</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="reference"
          label="Reference"
          type="text"
          fullWidth
          variant="outlined"
          value={newRow.reference}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="title"
          label="Title"
          type="text"
          fullWidth
          variant="outlined"
          value={newRow.title}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

const App = () => {
  const [rowData, setRowData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const STATUSES = ['Not Started', 'In Progress', 'Completed', 'Archived'];

  const columns = [
    { field: 'id', headerName: 'ID', width: 90, hidden: true },
    { field: 'issue_reference', headerName: 'Reference', width: 100 },
    { field: "issue_raiseddate", headerName: 'Date', width: 100, renderCell: (params) => {
      const date = new Date(params.value);
      const formattedDate = date.toLocaleDateString('en-AU');
      return <div>{formattedDate}</div>;
    },},
        {field: "issue_responsiblecontactpersontext", headerName: 'Adviser', width: 150},
        {field: "issue_causecontactpersontext", headerName: 'Responsible Person', width: 150},
        {field: "issue_responsiblecontactperson_streetstate", headerName: 'State', width: 50},
        {field: "issue_responsiblecontactperson_contactbusiness_tradename", headerName: 'Licensee', width: 150},
        {field: "issue_responsiblecontactbusinesstext", headerName: 'Business', width: 200},
    { field: 'issue_title', headerName: 'Title', width: 230 },
    {field: "issue_seissueidentification", headerName: 'Source', width: 80},
        {field: "issue_seimpact", headerName: 'Impact', width: 80},
        {field: "issue_statustext", headerName: 'Status', width: 100, type: "singleSelect",
        valueOptions: ["Not Started", "In Progress", "Completed", "Archived"] },
        {field: "issue_seclientobject1_firstname", headerName: 'Manager', width: 100},
    {
      field: 'actions',
      headerName: 'Actions',
      width: 90,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <Button
            color="primary"
            size="small"
            onClick={() => handleEditClick(params.row)}
            sx={{ color: '#272D3B', minWidth: 'auto', padding: '6px', "&:hover": { backgroundColor: 'rgba(39, 45, 59, 0.1)' }, "&:focus": { outline: 'none' } }}
          >
            <i className="fas fa-edit"></i> {/* Font Awesome Edit Icon */}
          </Button>
          <Button
            color="error"
            size="small"
            onClick={() => handleDeleteClick(params.id)}
            sx={{ color: '#272D3B', minWidth: 'auto', padding: '6px', marginLeft: '8px', "&:hover": { backgroundColor: 'rgba(39, 45, 59, 0.1)' }, "&:focus": { outline: 'none' } }}
          >
            <i className="fas fa-trash"></i> {/* Font Awesome Trash Icon */}
          </Button>
        </>
      ),
    },
  ];

  const [isLoading, setIsLoading] = useState(false);

  const fetchIssues = () => {
    setIsLoading(true);
    const criteria = JSON.stringify({
      "fields": [
        {"name": "issue_reference"},
        {"name": "issue_raiseddate"},
        {"name": "issue_responsiblecontactpersontext"},
        {"name": "issue_causecontactpersontext"},
        {"name": "issue_responsiblecontactperson_streetstate"},
        {"name": "issue_responsiblecontactperson_contactbusiness_tradename"},
        {"name": "issue_responsiblecontactbusinesstext"},
        {"name": "issue_title"},
        {"name": "issue_seissueidentification"},
        {"name": "issue_seimpact"},
        {"name": "issue_statustext"},
        {"name": "issue_seclientobject1_firstname"},
        // Add other fields as needed
      ],
      "sorts": [{"name": "issue_raiseddate", "direction": "desc"}],
      "options": {"rf": "json", "startrow": "0", "rows": 50}
    });

    const urlEncodedData = new URLSearchParams();
    urlEncodedData.append("criteria", criteria);

    axios.post('/rpc/issue/?method=ISSUE_SEARCH', urlEncodedData, {
      headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
    })
    .then(response => {
      setRowData(response.data.data.rows);
    })
    .catch(error => {
      console.error('There was a problem with the Axios operation:', error);
    })
    .finally(() => {
      setIsLoading(false); // Update state to indicate loading is finished
    });
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // const handleSearchChange = (searchValue) => {
  //   gridRef.current.api.setQuickFilter(searchValue);
  // };

  const handleSearchChange = (searchValue) => {
    setSearchTerm(searchValue.toLowerCase());
  };

  const filteredRows = rowData.filter((row) => {
    // Ensure there's a default value for the fields before calling toLowerCase()
    const issueReference = row.issue_reference ? row.issue_reference.toLowerCase() : '';
    const issueTitle = row.issue_title ? row.issue_title.toLowerCase() : '';
    return issueReference.includes(searchTerm) || issueTitle.includes(searchTerm);
  });

  const handleAddNewClick = () => {
    setSelectedRowData(null);
    setIsModalOpen(true);
  };

  const handleSaveNewRow = (newOrUpdatedRow) => {
    let newData = [...rowData];
    if (newOrUpdatedRow.id) {
      // Update existing row
      newData = newData.map(row => row.id === newOrUpdatedRow.id ? newOrUpdatedRow : row);
    } else {
      // Add new row with a new unique ID
      const newId = rowData.length > 0 ? Math.max(...rowData.map(r => r.id)) + 1 : 1;
      newOrUpdatedRow.id = newId; // Assign new ID to the new row
      newData = [...newData, newOrUpdatedRow];
    }
  
    setRowData(newData);
    setIsModalOpen(false);
    setSearchTerm(''); // Reset search term to ensure the new/updated row is visible
  };

  const handleEditClick = (row) => {
    setSelectedRowData(row);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setRowData(rowData.filter(row => row.id !== id));
  };

  const exportToExcel = (rowData) => {
    const exportData = rowData.map(row => ({
      // ID: String(row.id),
      Reference: row.issue_reference,
      Title: row.issue_title,
      // Map other fields as needed
    }));
  
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ExportedData");
    XLSX.writeFile(wb, "exported_data.xlsx");
  };

  const theme = createTheme({
    components: {
      MuiDataGrid: {
        styleOverrides: {
          root: {
            '.MuiDataGrid-row': {
              backgroundColor: '#f0f0f0', // Change row background color
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'lightgrey', // Updated row hover color
            },
            '& .MuiTablePagination-root': {
              color: '#272D3B', // Changes the color of the text
              backgroundColor: 'white', // Changes the background color
            },
            '& .MuiPaginationItem-root': {
              color: 'white', // Changes the color of pagination buttons
            },
            '& .MuiDataGrid-footerContainer': {
              color: 'white', // Changes the color of pagination buttons
            },
            '& .MuiDataGrid-row.Mui-selected, & .MuiDataGrid-row.Mui-selected:hover': {
              backgroundColor: 'lightgrey', // Change this to your preferred selected row color
              // Use rgba for a slightly transparent color effect, allowing row details to remain visible
            },
            '& .MuiDataGrid-row': {
              backgroundColor: 'white', // Your desired row background color
            },
          },
        },
      },
    },
  });

  return (
    <div className="page-container">
      <Navbar onSearchChange={handleSearchChange} />
      <div className="grid-toolbar">
        <Button variant="contained" onClick={handleAddNewClick} sx={{ backgroundColor: '#272D3B;', '&:hover': { backgroundColor: '#272D3B;' } }}>Add New</Button>
        <Button variant="contained" onClick={() => exportToExcel(rowData)} style={{ marginLeft: 8 }} sx={{ backgroundColor: '#272D3B;', '&:hover': { backgroundColor: '#272D3B;' } }}>
          Export to Excel
        </Button>
        {/* Handle export button if needed */}
      </div>
      <NewRowModal isOpen={isModalOpen} onSave={handleSaveNewRow} onClose={() => setIsModalOpen(false)} editRow={selectedRowData} />
      <ThemeProvider theme={theme}>
      <div style={{ height: 750, width: '100%' }}>
        <DataGridPro
          rows={filteredRows}
          columns={columns}
          pageSize={30}
          rowsPerPageOptions={[30, 50, 100]}
          loading={isLoading}
          // checkboxSelection
          disableSelectionOnClick
          initialState={{
            columns: {
              columnVisibilityModel: {
                id: false, // This will hide the 'id' column
              },
            },
          }}
        />
      </div>
      </ThemeProvider>
    </div>
  );
};

export default App;
