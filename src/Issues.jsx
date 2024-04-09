import React, { useState, useEffect } from 'react';

function Issues() {
  // Initialize state to hold the issues
  const [issues, setIssues] = useState([]);
  const criteria = JSON.stringify({
    "fields":
    [
      // List of fields you require, you can remove others for brevity
      {"name": "issue_reference"},
      {"name": "issue_title"},
    ],
    "sorts":
    [
      { 
        "name": "issue_raiseddate",
        "direction": "desc"
      }
    ],
    "options":
    {
      "rf": "json",
      "startrow": "0",
      "rows": 10	
    }
  });
  const urlEncodedData = new URLSearchParams();
  urlEncodedData.append("criteria", criteria);

  useEffect(() => {
    fetch('/rpc/issue/?method=ISSUE_SEARCH', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', // Correct header for JSON content
      },
      cache: 'no-cache',
      body: urlEncodedData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
        console.log(data);
        console.log(data.rows);
        setIssues(data.data.rows); // Update state with the fetched issues
        console.log(issues);
    })
    .catch(error => console.error('There was a problem with the fetch operation:', error));
  }, []); // The empty array ensures this effect runs once after the initial rendering

  return (
    <div>
      <h3>Issues</h3>
      <div style={{ maxHeight: '200px', 'overflow-y': 'scroll' }}>
        {issues.map((item, index) => (
          <div key={index}>
            <p><strong>Reference:</strong> {item.issue_reference} test</p>
            <p><strong>Raised Date:</strong> {item.issue_raiseddate} test</p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Issues;