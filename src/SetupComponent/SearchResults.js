import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Table, Collapse } from "antd";

const SearchResults = () => {
  const location = useLocation();
  const { searchResults } = location.state || {};
  console.log('search results');
  console.log(JSON.stringify(searchResults));
  const [groupedData, setGroupedData] = useState({});
  const [columns, setColumns] = useState({});

  useEffect(() => {
    setGroupedData();
    if (searchResults) {
      const grouped = {};
      const columnConfig = {};

      Object.keys(searchResults).forEach((key) => {
        const { records } = searchResults[key];

        // Filter out empty or invalid records
        const validRecords = Array.isArray(records)
          ? records.filter((record) => record && typeof record === "object")
          : [];

        // Only add non-empty groups
        if (validRecords.length > 0) {
          grouped[key] = validRecords;

          // Dynamically set columns based on the first record's keys
          columnConfig[key] = Object.keys(validRecords[0]).map((field) => ({
            title: field,
            dataIndex: field,
            key: field,
            render: (text, record) =>
              field === "Name" ? (
                <Link
                  to={`/record/${key}/${record._id}`}
                  style={{ cursor: "pointer", textDecoration: "none" }}
                >
                  {text}
                </Link>
              ) : (
                text
              ),
          }));
        }
      });

      setGroupedData(grouped);
      setColumns(columnConfig);
    }
  }, [searchResults]);

  return (
    <div>
      <h1>Search Results</h1>

      {/* Display grouped data using Collapse and Table */}
      {Object.keys(groupedData).map((objectName) => (
        <Collapse
          style={{ marginBottom: "10px" }}
          key={objectName}
          defaultActiveKey={["1"]}
        >
          <Collapse.Panel header={objectName} key="1">
            <Table
              columns={columns[objectName]}
              dataSource={groupedData[objectName]}
              rowKey={(record) =>
                record._id || record.Name || record.Email || Math.random()
              }
              pagination={false}
            />
          </Collapse.Panel>
        </Collapse>
      ))}
    </div>
  );
};

export default SearchResults;
