import React, { useState, useEffect } from "react";
import { Modal, Select, Input, Button, Row, Col, Spin, message } from "antd";
import ApiService from "../Components/apiService";
import { BASE_URL } from "../Components/Constant";

const { Option } = Select;

const ExportModal = ({ isExportModalVisible, setIsExportModalVisible, objectPluralName, objectName, record }) => {
  const [loading, setLoading] = useState(false);
  const [conditions, setConditions] = useState([
    { field: "", operator: "Equals", value: "" },
  ]);
  const [logic, setLogic] = useState("AND");

  useEffect(() => {
    if (isExportModalVisible) {
      console.log("Exporting records...", record);
      console.log("Exporting records...", objectName);
      // Reset conditions to default when modal is opened
      setConditions([{ field: "", operator: "Equals", value: "" }]);
    }
  }, [isExportModalVisible]);

  const handleExportClick = async () => {
    setLoading(true);

    const filters = conditions.reduce((acc, condition) => {
      if (condition.field && condition.value) {
        acc[condition.field] = condition.value;
      }
      return acc;
    }, {});

    const body = { object_name: objectName, filters };

    try {
      const apiServiceForExport = new ApiService(
        `${BASE_URL}/export_to_csv`,
        { "Content-Type": "application/json" },
        "POST",
        body
      );
      const response = await apiServiceForExport.makeCall();
      console.log("response", response);

      if (!response || response.trim() === "") {
        throw new Error("Empty response from server");
      }

      const lines = response.trim().split("\n");
      if (lines.length <= 1) {
        throw new Error("No data rows found in the response");
      }

      const blob = new Blob([response], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${objectName}_Export.csv`);
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success("CSV file has been exported successfully");
      setIsExportModalVisible(false);
    } catch (error) {
      console.error("Error exporting records:", error);
      message.error(error.message || "Error exporting CSV file");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCondition = () => {
    setConditions([...conditions, { field: "", operator: "Equals", value: "" }]);
  };

  const handleConditionChange = (index, key, value) => {
    const updatedConditions = [...conditions];
    updatedConditions[index][key] = value;
    setConditions(updatedConditions);
  };

  const handleRemoveCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setIsExportModalVisible(false);
    setConditions([{ field: "", operator: "Equals", value: "" }]);
  };

  return (
    <Modal
      title={`Export ${objectPluralName} Records`}
      visible={isExportModalVisible}
      onOk={handleExportClick}
      onCancel={handleCancel}
      okText="Export"
      cancelText="Cancel"
      centered
    >
      <Spin spinning={loading} tip="Loading..." size="small">
        <p>Define Filter Parameters:</p>
        <div style={{ marginBottom: "16px" }}>
          <Select
            value={logic}
            onChange={(value) => setLogic(value)}
            style={{ width: "200px" }}
          >
            <Option value="AND">AND</Option>
          </Select>
        </div>
        {conditions.map((condition, index) => (
          <Row key={index} gutter={16} align="middle" style={{ marginBottom: "8px" }}>
            <Col span={6}>
              <Select
                placeholder="Field"
                value={condition.field}
                onChange={(value) => handleConditionChange(index, "field", value)}
                style={{ width: "100%" }}
              >
                {record &&
                  Object.keys(record).map((key) => (
                    <Option key={key} value={key}>
                      {key}
                    </Option>
                  ))}
              </Select>
            </Col>
            <Col span={6}>
              <Select
                value={condition.operator}
                onChange={(value) => handleConditionChange(index, "operator", value)}
                style={{ width: "100%" }}
              >
                <Option value="Equals">Equals</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Input
                placeholder="Value"
                value={condition.value}
                onChange={(e) => handleConditionChange(index, "value", e.target.value)}
              />
            </Col>
            <Col span={2}>
              <Button danger onClick={() => handleRemoveCondition(index)}>
                Remove
              </Button>
            </Col>
          </Row>
        ))}
        <Button type="dashed" onClick={handleAddCondition} style={{ width: "100%" }}>
          Add Condition
        </Button>
      </Spin>
    </Modal>
  );
};

export default ExportModal;