import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { useLocation, useNavigate, Link, json } from 'react-router-dom';
import { BASE_URL } from '../Components/Constant';
import ApiService from '../Components/apiService';
const FieldHistory = () => {
  const location = useLocation();
  const { record } = location.state || {};
  const [arrayData, setArrayData] = useState([]);
  let data;
  let responseResult;
  let resultArray;
  // let arrayData;
  useEffect(() => {
    console.log('record');
    console.log(record);
    try {
      const apiService = new ApiService(
        `${BASE_URL}/field_history/${record._id}`,
        'GET'
      );
      const response = apiService.makeCall();
      responseResult = response;
      handlePromise();
    }
    catch {
      console.log('error while fetching field tracking data');
    }
  }, [])
  const handlePromise = async () => {
    try {
      const result = await responseResult; // Resolving the promise
      console.log("Resolved result as JSON string:"+JSON.stringify(result));

      let finalRes = [];
      result.forEach((item) => {
        const changedByJson = item.changed_by.replace(/=>/g, ":");
        console.log(JSON.parse(changedByJson).user_id);
        console.log('item : '+item)
        console.log('item : '+JSON.stringify(item))
        finalRes.push(
          {key: item._id, 
          date: new Date(item.changed_at).toLocaleString(), // Format the date
          field: item.field_name,
          // user: JSON.parse(changedByJson).user_id,
          user: JSON.parse(changedByJson).user_id, // Parse user_id from changed_by
          originalvalue: item.old_value,
          newvalue: item.new_value
        }
        );
      });
      setArrayData(finalRes);
      console.log('finalRes : '+JSON.stringify(finalRes));
      // data = result.map((item, index) => ({
      //     key: item._id, // Unique key
      //     date: new Date(item.changed_at).toLocaleString(), // Format the date
      //     field: item.field_name,
      //     user: item.changed_by.user_id, // Parse user_id from changed_by
      //     originalvalue: item.old_value,
      //     newvalue: item.new_value,
      //   }));

      
        
      // setArray?Data(data);
      console.log('arrayData'+JSON.stringify(data));

      console.log(data);

      console.log(typeof (resultArray));
      console.log([resultArray]);
      // console.log(JSON.stringify(result, null, 2)); // Convert to JSON string
      // console.log('resolved'+resultArray);
    } catch (error) {
      console.error("Error resolving promise:", error);
    }
  };


  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',

    },
    {
      title: 'Field',
      dataIndex: 'field',

    },
    {
      title: 'User',
      dataIndex: 'user',

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

  // const data = arrayData.map((item, index) => ({
  //   key: item._id, // Unique key
  //   date: new Date(item.changed_at).toLocaleString(), // Format the date
  //   field: item.field_name,
  //   user: JSON.parse(item.changed_by).user_id, // Parse user_id from changed_by
  //   originalvalue: item.old_value,
  //   newvalue: item.new_value,
  // }));

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
  };
  return (
    <div>

      <h2>History</h2>
      <Table
        columns={columns}
        dataSource={arrayData}
        onChange={onChange}
      // showSorterTooltip={{
      // target: 'sorter-icon',
      // }}
      />
    </div>
  )


};
export default FieldHistory;