import React, { useEffect, useState } from "react";
import { useLocation,Link } from 'react-router-dom';
import { Table, Collapse } from 'antd';

const SearchResults = ()=>{
    const location = useLocation();

    const { searchResults } = location.state || {};
    console.log('inside searchres component');
    console.log(searchResults);
    const [groupedData, setGroupedData] = useState({});
    useEffect(() => {
        if (searchResults) {
          // Grouping the records by 'objectName'
          const grouped = searchResults.reduce((acc, record) => {
            const { objectName, label, value } = record;
            if (!acc[objectName]) {
              acc[objectName] = [];
            }
            acc[objectName].push({ label, value,objectName });
            return acc;
          }, {});
          setGroupedData(grouped);
        }
      }, [searchResults]);
    
      // Ant Design Table Columns
      const columns = [
        {
          title: 'Label',
          dataIndex: 'label',
          key: 'label',
          render: (text, record) => (
            // Wrapping the label with a Link to the record page
            <Link to={`/record/${record.objectName}/${record.value}`}
            style={{ cursor: 'pointer', textDecoration: 'none' }} 
            >
              {text}
            </Link>
          ),
    
        },
        {
          title: 'Value',
          dataIndex: 'value',
          key: 'value',
        },
      ];
    
      return (
        <div>
          <h1>Search Results</h1>
    
          {/* Display grouped data using Collapse and Table */}
          {Object.keys(groupedData).map((objectName) => (
            <Collapse key={objectName} defaultActiveKey={['1']}>
              <Collapse.Panel header={objectName} key="1">
                <Table
                  columns={columns}
                  dataSource={groupedData[objectName]}
                  rowKey="value"
                  pagination={false}
                />
              </Collapse.Panel>
            </Collapse>
          ))}
        </div>
      );
    
}
export default SearchResults;