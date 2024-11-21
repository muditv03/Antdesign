import React from 'react';
import { Table } from 'antd';
const FieldHistory = () => {
    // const parseAndFormatDate = (dateString) => {
    //     if (typeof dateString !== "string") {
    //       console.error("Invalid date, not a string:", dateString);
    //       return 0; // Fallback value
    //     }
      
    //     try {
    //       // Split the input string `DD/MM/YYYY, HH:mm AM/PM`
    //       const [datePart, timePart] = dateString.split(', ');
    //       if (!datePart || !timePart) {
    //         console.error("Invalid date format:", dateString);
    //         return 0;
    //       }
      
    //       const [day, month, year] = datePart.split('/');
    //       const formattedDate = `${year}-${month}-${day} ${timePart}`;
      
    //       // Return as a timestamp for sorting
    //       return new Date(formattedDate).getTime();
    //     } catch (error) {
    //       console.error("Error formatting date:", dateString, error);
    //       return 0; // Fallback value
    //     }
    //   };


const columns = [
  {
    title: 'Date',
    dataIndex: 'date',
    // sorter: (a, b) => {
    //     const dateA = parseAndFormatDate(a.date);
    //     const dateB = parseAndFormatDate(b.date);
    //     return dateA - dateB; // Compare the timestamps
    //   },    
      
    // showSorterTooltip: {
    //   target: 'full-header',
    // },
    // filters: [
    //   {
    //     text: 'Joe',
    //     value: 'Joe',
    //   },
    //   {
    //     text: 'Jim',
    //     value: 'Jim',
    //   },
    //   {
    //     text: 'Submenu',
    //     value: 'Submenu',
    //     children: [
    //       {
    //         text: 'Green',
    //         value: 'Green',
    //       },
    //       {
    //         text: 'Black',
    //         value: 'Black',
    //       },
    //     ],
    //   },
    // ],
    // specify the condition of filtering result
    // here is that finding the name started with `value`
    // onFilter: (value, record) => record.name.indexOf(value) === 0,
    // sorter: (a, b) => a.name.length - b.name.length,
    // sortDirections: ['descend'],
  },
  {
    title: 'Field',
    dataIndex: 'field',
    // defaultSortOrder: 'descend',
    // sorter: (a, b) => a.Field - b.Field,
  },
  {
    title: 'User',
    dataIndex: 'user',
    // filters: [
    //   {
    //     text: 'London',
    //     value: 'London',
    //   },
    //   {
    //     text: 'New York',
    //     value: 'New York',
    //   },
    // ],
    // onFilter: (value, record) => record.address.indexOf(value) === 0,
  },
  {
    title: 'Original Value',
    dataIndex: 'originalvalue',
  },
  {
    title: 'New Value',
    dataIndex: 'newvalue', 
  }
];
const data = [
  {
    key: '1',
    date: '19/11/2024 11:41 am',
    field: 'Account name1',
    user: 'Shivam',
    originalvalue: 'sdfv',
    newvalue: 'asf'
  },
  {
    key: '2',
    date: '19/11/2026 11:10 am',
    field: 'Account name2',
    user: 'Shivam',
    originalvalue: 'dcvg',
    newvalue: 'qwer'
  },
  {
    key: '3',
    date: '19/11/2025 10:41 am',
    field: 'Account name3',
    user: 'Shivam',
    originalvalue: 'qwerty',
    newvalue: 'xcvb'
  }
  
];
const onChange = (pagination, filters, sorter, extra) => {
  console.log('params', pagination, filters, sorter, extra);
};
return(
    <div>
        
    <h2>History</h2>
    <Table
        columns={columns}
        dataSource={data}
        onChange={onChange}
        // showSorterTooltip={{
        // target: 'sorter-icon',
        // }}
    />
</div>
)
   

};
export default FieldHistory;